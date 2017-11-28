import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {emitSocket} from './socket';


class Chat extends React.Component {
  constructor(props){
    super(props)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  componentDidUpdate(){
    this.elem.scrollTop = this.elem.scrollHeight
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.message = e.target.value
      emitSocket(this.message);
      e.target.value = "";
    }
  }


  render(){
    const {chatMessages} = this.props;
    if(chatMessages){
      var messages = (
        <div className="chat-container" ref={elem => this.elem = elem}>
        {chatMessages.map(msg =>
        <div className="message-container">
          <div id="chat-image"><img className="image-sm-chat"src={msg.profilepicurl}/></div>
          <p className="message">{msg.first}  {msg.time}</p>
          <div className="time">{msg.msg}</div>
        </div>
        )}
        </div>
      )
    }else{
      messages= null
    }

    return(
      <div className="container-flex-column">
        {messages}
        <textarea id="chat-message" placeholder="Message #fit-talk" onKeyPress={this.handleKeyPress}></textarea>
    </div>
    )
  }
}

const mapStateToProps = function(state) {
    return {
        chatMessages: state.chatMessages
    }
}

export default connect(mapStateToProps)(Chat);
