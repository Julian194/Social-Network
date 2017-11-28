import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import TypedReactDemo from './Typed'

const Login = wrapInAuthForm(LoginForm, '/login');
const Registration = wrapInAuthForm(RegistrationForm, '/register');

export {Login, Registration}


function wrapInAuthForm(Component, url) {
    return class AuthForm extends React.Component {
        constructor(props) {
            super(props);
            this.state = {};
            this.url = url;
        }
        handleInput(e) {
          this[e.target.name] = e.target.value;
        }
        handleSubmit(e) {
          axios.post(this.url,  {
            first:this.first,
            last:this.last,
            email: this.email,
            password: this.password
        }).then((res)=> {
          if(res.data.success){
            location.replace('/')
          } else {
              this.setState({
                error:true
              })
            }
          })
        }
        render() {
            return <Component error={this.state.error}
            		    handleInput={e => this.handleInput(e)}
                    handleSubmit={ e => this.handleSubmit(e)} />;
        }
    }
}

function RegistrationForm({ handleInput, handleSubmit, error }) {
    return (
        <div>
          <TypedReactDemo
            strings={[
              'Are you looking for a new workout buddy?',
              'Do you want to share training tips?',
              'Are you here to talk about nutrition?',
              'Discuss all of this now!',
              'Sign up and become a member of our community!'
            ]}
          />
          {error && <p style={{color:"red"}}>Something went wrong</p>}
          <div className="form">
            <div className="input">
              <input type="text" name="first" onChange={handleInput} placeholder="First Name"/>
            </div>

            <div className="input">
              <input type="text" name="last" onChange={handleInput} placeholder="Last Name"/>
            </div>

            <div className="input">
              <input type="email" name="email" onChange={handleInput} placeholder="Email"/>
            </div>

            <div className="input">
              <input type="password" name="password" onChange={handleInput} placeholder="Password"/>
            </div>
            <button className="button" onClick={handleSubmit}> Register </button>
          </div>

          <p>Already a member? <Link to="/login">Please Login</Link></p>
      	</div>
    );
}

function LoginForm({ handleInput, handleSubmit, error }) {
    return (
        <div>
          {error && <p style={{color:"red"}}>Something went wrong</p>}
          <div className="form">
            <div className="input">
              <input name="email"type="email" onChange={handleInput} placeholder="Email"/>
            </div>
            <div className="input">
              <input name="password" type="password" onChange={handleInput} placeholder="Password"/>
            </div>
            <button className="button" onClick={handleSubmit}>Login</button>
          </div>
      	</div>
    );
}
