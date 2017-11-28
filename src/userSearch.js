import React from 'react';
import axios from 'axios';
import {Link} from 'react-router';


export default class UserSearch extends React.Component{
  constructor(props){
    super(props)
    this.uploadUserSearch= this.uploadUserSearch.bind(this)
    this.getInput = this.getInput.bind(this)
    this.state = {}
  }

  getInput(e){
      this.SearchInput = e.target.value
      this.uploadUserSearch()
  }


  uploadUserSearch() {
    axios.post('/userSearch', {
      userSearch : this.SearchInput
    }).then(({data}) => {
      this.setState({users : data.users})
    })
  }

  render() {
    const {users} = this.state
    if(!users){
      return (
        <div id="search">
          <input type="text" onChange={this.getInput} ref={elem => this.elem = elem}/>
          <i className="fa fa-search"/>
        </div>
      );
    }

    const userList = (
      <div id="results">
        {users.map(user=> <Link to={'/user/'+user.id} onClick={()=>this.elem.value= ""}><div id="user-result">{user.firstname} {user.lastname}</div></Link>)}
      </div>
    );

    return(
    <div id="search">
      <input type="text" onChange={this.getInput}/>
      <i className="fa fa-search"/>
      {userList}
    </div>
    )
  }

}
