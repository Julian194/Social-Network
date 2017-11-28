import React from 'react';
import { connect } from 'react-redux';
import { receiveFriendRequests,acceptFriendRequest,endFriendship,rejectFriendRequest } from './actions';
import {Link} from 'react-router';


class Friends extends React.Component {
  constructor(props){
    super(props)
  }

  componentDidMount(){
    this.props.getList()
  }

  render(){

    const {friendsPending, friendsAccepted} = this.props;
    if(!friendsPending && !friendsAccepted ){
      return null;
    }

    const pending = (
      <div className="friends-container">
        {friendsPending.map(friend =>
        <div>
          <Link id="userprofile" to={'/user/'+friend.id}><div id="friend-pic"><img src={friend.profilepicurl}/></div></Link>
          <Link id="userprofile" to={'/user/'+friend.id}><p>{friend.first} {friend.last}</p></Link>
          <div className="flex-button">
            <button onClick={()=>{this.props.acceptFriendRequest(friend.id)}}>Accept Request</button>
            <button onClick={()=>{this.props.rejectFriendRequest(friend.id)}}>Reject Request</button>
          </div>
        </div>)}
      </div>
    );

    const friend =( 
      <div className="friends-container">
        {friendsAccepted.map(friend =>
        <div>
        <Link id="userprofile" to={'/user/'+friend.id}><div id="friend-pic"><img src={friend.profilepicurl}/></div></Link>
        <Link id="userprofile" to={'/user/'+friend.id}><p>{friend.first} {friend.last}</p></Link>
        <div className="flex-button">
          <button onClick={()=>{this.props.endFriendship(friend.id)}}>End Friendship</button>
        </div>
        </div>)}
      </div>
    );

    return(
      <div>
         {friendsPending.length > 0 && <h3> These people want to be your friends </h3>}
        {pending}
         {friendsAccepted.length >0 && <h3> These people are currently your friends </h3>}
        {friend}
      </div>
    )
  }
}


const mapStateToProps = function(state) {
    return {
        friendsPending: state.friends && state.friends.filter(friend => friend.status == 1),
        friendsAccepted: state.friends && state.friends.filter(friend => friend.status == 2)
    }
}

const mapDispatchToProps = function(dispatch) {
    return {
        getList: ()=> dispatch(receiveFriendRequests()),
        acceptFriendRequest: (id) => dispatch(acceptFriendRequest(id)),
        endFriendship: (id) => dispatch(endFriendship(id)),
        rejectFriendRequest: (id) => dispatch(rejectFriendRequest(id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
