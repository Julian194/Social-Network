import axios from 'axios';

export function receiveFriendRequests() {
    return axios.get('/friendRequests').then(function({ data }) {
        return {
            type: 'RECEIVE_FRIEND_REQUESTS',
            friends: data.friends
        };
    });
}

export function acceptFriendRequest(id) {
    console.log("received", id)
    return axios.post('/acceptFriendRequest/' + id).then(function() {
        return {
            type: 'ACCEPT_FRIEND_REQUEST',
            id
        };
    });
}

export function endFriendship(id) {
  console.log("received", id)
    return axios.post('/endFriendship/' + id).then(function() {
        return {
            type: 'END_FRIENDSHIP',
            id
        };
    });
}

export function rejectFriendRequest(id) {
  console.log("received", id)
    return axios.post('/rejectFriendRequest/' + id).then(function() {
        return {
            type: 'REJECT_FRIEND_REQUEST',
            id
        };
    });
}

export function onlineUsers(users){
  return{
    type: 'ONLINE_USERS',
    users: users[0],
    content: users[1]

  }
}

export function userJoined(user){
  return{
    type: 'USER_JOINED',
    user: user
  }
}

export function userLeft(id){
  return{
    type: 'USER_LEFT',
    id
  }
}

export function chatMessage(msg){
  return{
    type: 'CHAT_MSG',
    content: msg.messages
  }
}
