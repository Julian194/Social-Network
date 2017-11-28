import React from 'react'
import Bio from './bio'
import TitleImage from './titleImage'
import TitleImageUpload from './titleImageUpload'

export default class Profile extends React.Component {
  constructor(props){
    super(props)
    this.state = {};
  }

  render(){
    if (!this.props.id) {
           return null;
       }

    return(
      <div>
        <TitleImage {...this.props}/>
        <TitleImageUpload {...this.props}/>
        <div className="profile">

        <div id="profilePicLg">
          <img src={this.props.profilePicUrl} alt={`${this.props.firstName} ${this.props.lastName}`}/>
        </div>
        <Bio {...this.props}/>
        </div>
        <hr className="line"></hr>
        <h5 id="caption">My main lifts</h5>

        <div className="container-flex-profile">
          <div>Bench</div>
          <div>Deadlift</div>
          <div>Squat</div>
          <div>120 kg</div>
          <div>160 kg</div>
          <div>140 kg</div>
        </div>
      </div>
    )
  }
}
