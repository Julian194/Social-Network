import React from 'react';


export class Welcome extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return(
      <div className="bg">
        <div className="container">
          <h1  style={{ fontSize: '35px'}}>Welcome to the GYM</h1>
          <h4>Join the community today!</h4>
          <h5>Talk about everything fitness related.</h5>
          {this.props.children}
        </div>
      </div>
    )
  }
}
