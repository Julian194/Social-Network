import React from 'react';
import axios from 'axios';
import {emitNotification} from './socket';
import { connect } from 'react-redux';
import {receiveFriendRequests} from './actions';


class FriendButton extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      status: this.props.friendshipStatus.status,
      message: this.props.friendshipStatus.message
    }
  }

  updateFriendshipStatus(status){
    const updatedStatus = status
    const {id} = this.props.paramsId;
    axios.post(`/friendshipStatus/user/${id}`, {
      updatedStatus: updatedStatus,
    }).then(({data})=>{
        this.setState({
          status: data.status,
          message: data.message
        })
        this.props.dispatch(receiveFriendRequests())
      })
  }

  render(){
    return(
      <div>
        {this.state.message === "no entry" &&
        <button onClick={()=>{this.updateFriendshipStatus(1)}} className="friendship-button">Make Friend Request</button>}

        {this.state.message === "changeToMakeRequest" &&
        <button onClick={()=>{this.updateFriendshipStatus(1)}} className="friendship-button">Make Friend Request</button>}

        {this.state.status === 1 && this.state.message === "waitingForAccept" &&
        <button onClick={()=>{this.updateFriendshipStatus(3)}} className="friendship-button">Cancel Friend Request</button>}

        {this.state.status === 1 && this.state.message === "acceptRequest" &&
        <button onClick={()=>{this.updateFriendshipStatus(2)}} className="friendship-button">Accept Friend Request</button>}

        {this.state.message === "canTerminate" &&
        <button onClick={()=>{this.updateFriendshipStatus(4)}} className="friendship-button">End Friendship</button>}
      </div>
    )
  }
}


export default connect(function(state) {
    return {

    }
})(FriendButton);
