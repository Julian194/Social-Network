import React from 'react';
import Logo from './logo';
import ProfilePic from './profilePic';
import ImageUpload from './imageUpload';
import axios from 'axios';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import FriendNotifications from './friendNotifications';
import UserSearch from './userSearch'


export class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      imageUploadHidden: true
    }
  }

  showImageUpload() {
    this.setState({
      imageUploadHidden: !this.state.imageUploadHidden
    })
  }

  componentDidMount(){
    axios.get('/user').then(({data}) => {
      this.setState({
        firstName: data.first,
        lastName: data.last,
        profilePicUrl: data.profilepicurl,
        id: data.id,
        userBio: data.bio,
        titleimageurl: data.titleimageurl
      })
    })
  }

  render(){
    const children = React.cloneElement(this.props.children, {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        profilePicUrl: this.state.profilePicUrl,
        id: this.state.id,
        titleimageurl: this.state.titleimageurl,
        userBio: this.state.userBio,
        changeBio: bio => this.setState({userBio: bio}),
        updateTitleImg: url => this.setState({titleimageurl:url})
    })

    return(
      <div>
        <header className="nav">
          <Logo/>
          <div className="container-flex">
            <UserSearch/>
            <Link className="friend-link" to="/online">People</Link>
            <Link className="friend-link" to="/chat">Chat</Link>
            <Link className="friend-link" to="/friends">Friends</Link>
            <a className="friend-link" href="/logout">Logout</a>
            <FriendNotifications/>
            <ProfilePic
              user={this.state}
              onClick={() => this.showImageUpload()}
            />
          </div>
        </header>

        {this.state.imageUploadHidden == false && <ImageUpload
          updateImg={url => this.setState({profilePicUrl:url, imageUploadHidden: !this.state.imageUploadHidden})}
          onClick={() => this.showImageUpload()}
        />}

        {children}

        <div className="by">
          <p>by jkaiser</p>
        </div>

      </div>
    )
  }
}

const mapStateToProps = function(state) {
    return {
        requests: state.requests
    }
}

export default connect(mapStateToProps)(App);
