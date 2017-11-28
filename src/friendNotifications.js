import React from 'react';
import { connect } from 'react-redux';
import {receiveFriendRequests} from './actions';

class FriendNotifications extends React.Component{

  componentDidMount() {
      this.props.dispatch(receiveFriendRequests())
  }

  render() {
      if(this.props.count <=0 || this.props.count== undefined){
        return null
      }
      else{
      return <div id="notification">{this.props.count}</div>
    }
  }
}

export default connect(function(state) {
    return {
        count: state.friends && state.friends.filter(
            f => f.status == 1
        ).length
    }
})(FriendNotifications);
