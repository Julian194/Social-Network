const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('./bcrypt.js');
const spicedPg = require('spiced-pg');
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const toS3 = require('./toS3').toS3;
const s3Url = require('./config.json').s3Url
const dbQuery = require('./database/userQueries');
const relQuery = require('./database/relationshipQueries');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const db = spicedPg(process.env.DATABASE_URL || "postgres:juliankaiser:password@localhost:5432/socialnetwork");

//********* MIDDLEWARE *********//

var diskStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname + '/uploads');
  },
  filename: (req, file, callback) => {
    uidSafe(24).then((uid) => {
      callback(null, uid + path.extname(file.originalname));
    });
  }
});

var uploader = multer({
  storage: diskStorage,
  limits: {
    fileSize: 2097152
  }
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: 'supersecret',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(compression());

if (process.env.NODE_ENV != 'production') {
  app.use('/bundle.js', require('http-proxy-middleware')({
    target: 'http://localhost:8081/'
  }));
}

app.use(express.static(__dirname + '/public'));


//********* ROUTES *********//

app.get('/welcome', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.sendFile(__dirname + '/index.html');
  }
})

app.post('/register', (req, res) => {
  const {email,password,first,last} = req.body
  if (!email || !password || !first || !last) {
    res.json({
      success: false
    })
  } else {
    bcrypt.hashPassword(req.body.password)
      .then((hash) => {
        return dbQuery.addUser(first, last, email, hash)
        .then((result) => {
          const {first, last, id} = result.rows[0]
          req.session.user = {
            first: first,
            last: last,
            id: id,
            picUrl: "'https://api.adorable.io/avatars/285/${first}.png'"
          }
          res.json({
            success: true
          })
        })
      })
    }
  })

app.post('/login', (req, res) => {
  const {email, password} = req.body
  if (!email || !password) {
    res.json({
      success: false
    })
  } else {
    dbQuery.loginUser(email)
      .then((result) => {
        const {first,last,id,bio,password,profilepicurl} = result.rows[0];
        const data = result.rows[0];
        bcrypt.checkPassword(req.body.password, password)
          .then((doesMatch) => {
            if (doesMatch) {
              req.session.user = {
                first: first,
                last: last,
                id: id,
                bio: bio,
                image: profilepicurl == null ? 'https://api.adorable.io/avatars/285/${first}.png' : `${s3Url}${profilepicurl}`
              }
              res.json({
                success: true
              })
            } else {
              res.json({
                success: false
              })
            }
          })
      })
    }
})

app.post('/uploadUserPicture', uploader.single('file'), (req, res) => {
  const {filename} = req.file
  if (req.file) {
    toS3(req.file).then(() => {
      return  dbQuery.updateUserImg(filename, req.session.user.id)
      .then(() => {
        const url = `${s3Url}${filename}`
        console.log("saved in db")
        res.json({
          success: true,
          url: url
        });
      })
    })
  } else {
    res.json({
      success: false
    });
  }
})

app.post('/uploadTitleImage', uploader.single('file'), (req, res) => {
  const {filename} = req.file
  if (req.file) {
    toS3(req.file).then(() => {
      return  dbQuery.updateTitleImg(filename, req.session.user.id)
      .then(() => {
        const url = `${s3Url}${filename}`
        console.log("saved in db")
        res.json({
          success: true,
          url: url
        });
      })
    })
  } else {
    res.json({
      success: false
    });
  }
})

app.post('/userBioUpload', (req, res) => {
  dbQuery.updateUserBio(req.body.userBio, req.session.user.id)
  .then((result) => {
    const {bio} = result.rows[0]
    res.json({
      success: true,
      userBio: bio
    })
    req.session.user.bio = bio
  })
})

app.get('/user', (req, res) => {
  const loggedInUserId = req.session.user.id

  dbQuery.getUser(loggedInUserId)
  .then((result) => {
    let {first,last,bio,id,profilepicurl,titleimageurl} = result.rows[0]

    profilepicurl = profilepicurl == null ? 'https://api.adorable.io/avatars/285/${first}.png' : `${s3Url}${profilepicurl}`
    titleimageurl =`${s3Url}${titleimageurl}`

    res.json({
      first: first,
      last: last,
      id: id,
      bio: bio,
      profilepicurl: profilepicurl,
      titleimageurl:titleimageurl
    })
  })
})

// *** Friendship status in relationship table *** //
const PENDING = 1;
const ACCEPTED = 2;
const DECLINED = 3;
const TERMINATED = 4;
const REJECTED = 5;

app.get('/user/:id/info', (req,res) => {
  const loggedInUserId = req.session.user.id
  const paramsId = req.params.id

  Promise.all([
    dbQuery.getOtherUser(paramsId),
    relQuery.getUserFriendshipStatus(loggedInUserId,paramsId),
    relQuery.getUserFriendlist(paramsId)
  ])

    .then((result) => {
      const FRIENDLIST = result[2].rows;

      // if there is no relationship in the db
      if(!result[1].rows[0]){

        let {first,last,bio,id,profilepicurl,titleimageurl} = result[0].rows[0]
        let userIsLoggedIn

        userIsLoggedIn = loggedInUserId == id ? true : false
        profilepicurl = profilepicurl == null ? "https://api.adorable.io/avatars/285/"+ first +".png" : `${s3Url}${profilepicurl}`
        titleimageurl= `${s3Url}${titleimageurl}`
        FRIENDLIST.forEach(friend=>friend.profilepicurl=friend.profilepicurl == null ? "https://api.adorable.io/avatars/285/"+ first +".png" : `${s3Url}${profilepicurl}`)


        res.json({
          first: first,
          last: last,
          profilepicurl: profilepicurl,
          bio: bio,
          id: id,
          userIsLoggedIn: userIsLoggedIn,
          friendshipStatus: {
            status : 0,
            message: "no entry"
          },
          friendlist: FRIENDLIST,
          titleimageurl: titleimageurl
        })
      } else {

        let {first,last,bio,id,profilepicurl,titleimageurl} = result[0].rows[0]
        let {sender_id,recipient_id,status} = result[1].rows[0]
        let message

        profilepicurl = profilepicurl == null ? "https://api.adorable.io/avatars/285/"+ first +".png" : `${s3Url}${profilepicurl}`
        titleimageurl= `${s3Url}${titleimageurl}`
        FRIENDLIST.forEach(friend=>friend.profilepicurl=friend.profilepicurl == null ? "https://api.adorable.io/avatars/285/"+ first +".png" : `${s3Url}${friend.profilepicurl}`)


        if(status == PENDING){
          if(loggedInUserId === sender_id){
            message = "waitingForAccept"
          } else {
            message = "acceptRequest"
          }
        }
        if(status ==  ACCEPTED){
          message = "canTerminate"
        }
        if(status == TERMINATED){
          message = "changeToMakeRequest"
        }
        if(status == DECLINED){
          message = "changeToMakeRequest"
        }
        if(status == REJECTED){
          message = "changeToMakeRequest"
        }
        res.json({
          first: first,
          last: last,
          profilepicurl: profilepicurl,
          bio: bio,
          id: id,
          friendshipStatus: {
            status : status,
            message: message
          },
          friendlist: FRIENDLIST,
          titleimageurl: titleimageurl
        })
      }
    })
})


// ******** Friendship Status ******** //

app.post('/friendshipStatus/user/:id', (req,res) => {
  const {updatedStatus} = req.body
  const loggedInUser = req.session.user.id // loggedInUser
  const paramsId = Number(req.params.id) // otherUser
  const connectedSockets = online.find(user => user.userId == paramsId)

  // Case one -> no relationship or change status
  if(updatedStatus == 1){
    console.log("update to pending")
    relQuery.getUserFriendshipStatus(paramsId,loggedInUser)
      .then((result)=> {
        // if there is a relationship in the db update
        if(result.rows[0]){
          relQuery.updateFriendshipStatus(updatedStatus,loggedInUser,paramsId)
            .then((result)=> {

              const {status,sender_id} = result.rows[0]
              let message

              if(status == PENDING){
                if(req.session.user.id === sender_id){
                  message = "waitingForAccept"
                } else {
                  message = "acceptRequest"
                }
                res.json({
                  status: status,
                  message: message
                })
              }
              io.sockets.sockets[connectedSockets.socketId].emit('friendRequestNotification',{
                status: status
              })
            })

        } else {
          relQuery.addFriendshipStatus(loggedInUser,paramsId,updatedStatus)
          .then((result)=> {

            const {status,sender_id} = result.rows[0]
            let message

            if(status == PENDING){
              if(req.session.user.id === sender_id){
                message = "waitingForAccept"
              } else {
                message = "acceptRequest"
              }
            }
            res.json({
              status: status,
              message: message
            })
          })
        }
      })
  }
  // Case 2 -> relationship updated to accepted - "friends" now
  if(updatedStatus == 2){
    console.log("update to accepted")
    relQuery.updateFriendshipStatus(updatedStatus,paramsId,loggedInUser)
      .then((result)=> {
        res.json({
        status : result.rows[0].status,
        message : "canTerminate"
        })
        io.sockets.sockets[connectedSockets.socketId].emit('friendRequestNotification',{
          status: result.rows[0].status
        })
      })
  }
  // Case 3 -> made request but decided to decline
  if(updatedStatus == 3){
    console.log("update to declined")
    relQuery.updateFriendshipStatus(updatedStatus,paramsId,loggedInUser)
      .then((result)=> {
        res.json({
        status : result.rows[0].status,
        message : "changeToMakeRequest"
        })
        io.sockets.sockets[connectedSockets.socketId].emit('friendRequestNotification',{
          status: result.rows[0].status
        })
      })
  }
  // Case 4 -> terminated existing friendship
  if(updatedStatus == 4){
    console.log("update to terminated");
    relQuery.updateFriendshipStatus(updatedStatus,paramsId,loggedInUser)
      .then((result)=> {
        res.json({
          status: result.rows[0].status,
          message: "changeToMakeRequest"
        })
      })
  }
})

app.get('/friendRequests', (req,res) => { 
  relQuery.getFriends(req.session.user.id).then((result) => {
    const friends = result.rows
    friends.forEach((friend)=> {
      friend.profilepicurl = friend.profilepicurl == null ? "https://api.adorable.io/avatars/150/"+ friend.first +".png" : `${s3Url}${friend.profilepicurl}`
    })
    res.json({friends: friends})
  })
})

app.post('/acceptFriendRequest/:id', (req,res) => {
  relQuery.updateFriendshipStatus(2, req.session.user.id, req.params.id)
    .then(() => {
      res.json({success:true})
  })
})

app.post('/rejectFriendRequest/:id', (req,res) => {
  relQuery.updateFriendshipStatus(5, req.session.user.id, req.params.id)
    .then(() => {
      res.json({success:true})
  })
})

app.post('/endFriendship/:id', (req,res) => {
  relQuery.updateFriendshipStatus(4, req.session.user.id, req.params.id)
    .then(() => {
      res.json({success:true})
  })
})

app.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/welcome')
})

//*********** SOCKET IO ************//

let online = []
let messages = []

app.get('/connected/:socketId', (req,res)=>{

  // socketId will change anytime a new client connects, userId always with a unique login
  const socketId = req.params.socketId;
  const userId = req.session.user.id;
  // check if user is alreay (unique) is already in online array
  const userAlreadyOnline = online.find(user => user.userId == req.session.user.id)

  online.push({
    userId: userId,
    socketId: socketId
  });

  if(!userAlreadyOnline){
    let {first,last,id,bio,image} = req.session.user

    image = image == null ? "https://api.adorable.io/avatars/150/"+ first +".png" : `${s3Url}${image}`

    io.sockets.emit('userJoined',{
      first:first,
      last:last,
      profilepicurl:image,
      id:id
    })
  }

  relQuery.getUsersByIds(online.map(user => user.userId)).then(
    (result) => {

      const onlineUsers = result.rows
      onlineUsers.forEach((user)=> {
        user.profilepicurl = user.profilepicurl == null ? "https://api.adorable.io/avatars/150/"+ user.first +".png" : `${s3Url}${user.profilepicurl}`
      })

      io.sockets.sockets[socketId].emit('onlineUsers',{
      onlineUsers:onlineUsers,
      messages: messages
      })
    }
  ).catch(err => console.log(err))
})

io.on('connection', (socket) => {
    console.log(`socket with the id ${socket.id} is now connected`);

    socket.on('chatMessage', (data) => {
      const USERID = online.filter(user => user.socketId == socket.id)[0].userId

       dbQuery.getUser(USERID)
        .then(result => {

          const {first,last,profilepicurl} = result.rows[0]

         messages.push({
           msg: data.msg,
           first: first,
           last: last,
           profilepicurl: profilepicurl !== undefined ? `${s3Url}${profilepicurl}` : "https://api.adorable.io/avatars/150/"+ first +".png",
           time:new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
         })

         io.sockets.emit('chatMessage', {
           messages: messages
         })

       })
     })

    socket.on('disconnect', () => {
      console.log(`socket with the id ${socket.id} is now disconnected`);

      // filter for the socket that disconnected
      const socketDisconnect = online.filter(user => user.socketId === socket.id)[0];

      // find the index of the socket that disconnected
      const userIndex = online.indexOf(socketDisconnect);
      // get the socket out of the array
      online.splice(userIndex, 1);

      // checkt if the user is still connected via another socket
      var anotherConnection= online.find((user) =>{
        return user.userId == socketDisconnect.userId;
      })

      // if no other connection emit userleft event
      if(!anotherConnection){
        io.sockets.emit('userLeft',{
          id: socketDisconnect.userId
        });
      }

    });
});

app.post('/userSearch', (req,res) => {
  const {userSearch} = req.body
  if(userSearch==""){
    res.json({success:false})
  } else {
  dbQuery.serachUser(userSearch)
    .then(result => {
      res.json({users: result.rows})
    })
  }
})

app.get('*', (req, res) => {
  if (!req.session.user) {
    res.redirect('/welcome')
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

//********* SETUP PORT *********//

server.listen(8080, () => {
  console.log("I'm listening.")
});
