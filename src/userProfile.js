import React from 'react';
import axios from 'axios';
import { browserHistory } from 'react-router';
import FriendButton from './friendButton'
import {Link} from 'react-router';


export default class UserProfile extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      friendListIsHidden: true
    }
  }

  showFriendList() {
    this.setState({
      friendListIsHidden: !this.state.friendListIsHidden
    })
  }

  getUser(id) {
    axios.get(`/user/${id}/info`).then(({data}) => {
      if (data.userIsLoggedIn){
        browserHistory.push('/');
      }
      this.setState({
        first : data.first,
        last : data.last,
        profilepicurl : data.profilepicurl,
        bio : data.bio,
        id: data.id,
        paramsId: this.props.params,
        friendshipStatus: data.friendshipStatus,
        userIsLoggedIn: data.userIsLoggedIn,
        friendlist: data.friendlist,
        titleimageurl: data.titleimageurl
      })
    })
  }

  componentWillReceiveProps(nextProps){
    const {id} = nextProps.params;
    this.getUser(id)
  }

  componentDidMount(){
    const {id} = this.props.params;
    this.getUser(id)
  }


  render(){
    if (!this.state.id) {
      return null;
    }

    const {friendlist,profilepicurl,first,last,bio} = this.state

    return(
      <div>
        <div id="title-img">
          <img src={this.state.titleimageurl}/>
        </div>

        <div className="profile">
          <div className="friendbox" onClick={()=>this.showFriendList()}>See users friends ({friendlist.length})</div>

          {this.state.friendListIsHidden == false &&
          <div className="friendlist">
            {friendlist.map(friend=><Link to={'/user/'+friend.id}><p>{friend.first} {friend.last}</p></Link>)}
          </div>
          }

          <div id="profilePicLg">
            <img src={profilepicurl} alt={`${first} ${last}`}/>
          </div>

          <FriendButton {...this.state}/>

          <h3>{`${first} ${last}`} </h3>
          <p id="bio-text">{bio}</p>

          <hr className="line"></hr>
          <h5 id="caption">My main lifts</h5>

          <div className="container-flex-profile">
            <div>Bench</div>
            <div>Deadlift</div>
            <div>Squat</div>
            <div>150 kg</div>
            <div>180 kg</div>
            <div>160 kg</div>
          </div>
          </div>
      </div>
    )
  }

}
