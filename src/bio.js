import React from 'react';
import axios from 'axios';


export default class Bio extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      bioEditIsHidden: true
    }
    this.getBio = this.getBio.bind(this)
    this.uploadUserBio = this.uploadUserBio.bind(this)
    this.showBio = this.showBio.bind(this)
  }

  showBio() {
    this.setState({
      bioEditIsHidden: !this.state.bioEditIsHidden
    })
  }

  getBio(e){
    this.userBio = e.target.value
  }

  uploadUserBio() {
    axios.post('/userBioUpload', {
      userBio : this.userBio
    }).then(({data}) => {
      if(data.success){
        this.props.changeBio(data.userBio)
      } else{
        console.log("sth went wrong")
      }
      this.showBio()
    })
  }

  render() {
    return (
      <div className="userDetails">
        <p id="bio-text">{`${this.props.firstName} ${this.props.lastName}`}</p>

        {this.props.userBio === null &&
          <a onClick={() => this.showBio()}>Add your bio now</a>
        }

        {this.props.userBio !== null &&
          <div className="userInfo">
          <a id="userEdit"onClick={ () => this.showBio()}>{this.props.userBio}</a>
          </div>
        }

        {!this.state.bioEditIsHidden &&
          <div>
            <textarea id="bio"name="bio" onChange={this.getBio} placeholder="Change your bio here"></textarea>
            <br/>
            <button onClick={this.uploadUserBio} className="button">Save</button>
          </div>
        }
      </div>
    )
  }
}
