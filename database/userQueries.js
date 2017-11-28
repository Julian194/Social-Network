const spicedPg = require('spiced-pg');
const secrets = require('../secrets.json');

const db = spicedPg(process.env.DATABASE_URL ||"postgres:juliankaiser:password@localhost:5432/socialnetwork");

module.exports.addUser = function(first, last, email, password) {
  const insert = "INSERT INTO users (first, last, email, password) VALUES ($1,$2,$3,$4) RETURNING id"
  return db.query(insert, [first, last, email, password]);
}

module.exports.getUser = function(userId){
  const select = "SELECT * FROM users WHERE users.id = $1"
  return db.query(select, [userId])
}

module.exports.getOtherUser = function(userId){
  const select = "SELECT * FROM users WHERE id = $1"
  return db.query(select, [userId])
}

module.exports.loginUser = function(email){
  const select = "SELECT * FROM users WHERE email = $1"
  return db.query(select, [email])
}

module.exports.updateUserImg = function(imgURL, userId){
  const update = "UPDATE users SET profilepicurl = $1 WHERE users.id = $2"
  return db.query(update, [imgURL, userId])
}

module.exports.updateTitleImg = function(imgURL, userId){
  const update = "UPDATE users SET titleimageurl = $1 WHERE users.id = $2"
  return db.query(update, [imgURL, userId])
}

module.exports.updateUserBio = function(userBio, userId){
  const update = "UPDATE users SET bio = $1 WHERE users.id = $2 RETURNING bio"
  return db.query(update, [userBio, userId])
}

module.exports.serachUser = function(user){
  const select = `SELECT first AS Firstname,last AS Lastname,profilepicurl AS Picture, id as id from users WHERE first ILIKE $1`
  return db.query(select,['%' + user + '%'])
}
