import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import { Welcome } from './welcome';
import App from './app'
import {Login,Registration} from './AuthForm'
import Profile from './profile'
import UserProfile from './userProfile'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxPromise from 'redux-promise';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './reducers';
import Friends from './friends';
import OnlineUsers from './onlineUsers';
import {socket} from './socket'
import Chat from './chat'

export const store = createStore(reducer, composeWithDevTools(applyMiddleware(reduxPromise)));


if(location.pathname != '/welcome'){
  socket();
}

const notLoggedInRouter = (
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={Welcome}>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Registration}/>
        <IndexRoute component={Registration} />
      </Route>
    </Router>
  </Provider>
);

const loggedInRouter = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Profile}/>
        <Route path="/user/:id" component={UserProfile}/>
        <Route path="/friends" component={Friends}/>
        <Route path="/online" component={OnlineUsers}/>
        <Route path="/chat" component={Chat}/>
      </Route>
    </Router>
  </Provider>

);

let router;
if(location.pathname === '/welcome'){
  router = notLoggedInRouter
} else{
  router = loggedInRouter
}


ReactDOM.render(
    router,
    document.querySelector('main')
);
