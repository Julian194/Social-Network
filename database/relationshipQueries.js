const spicedPg = require('spiced-pg');
const secrets = require('../secrets.json');

const db = spicedPg(`postgres:${secrets.dbuser}:${secrets.dbpassword}@localhost:5432/socialnetwork`);

const PENDING = 1,
      ACCEPTED = 2,
      DECLINED = 3,
      TERMINATED = 4,
      REJECTED = 5

module.exports.addFriendshipStatus = function(sender_id, recipient_id, status){
  const insert = `INSERT INTO relationship (sender_id,recipient_id,status)
                  VALUES ($1,$2,$3) RETURNING status, sender_id`
  return db.query(insert, [sender_id,recipient_id,status])
}

module.exports.getUserFriendshipStatus = function(sender_id, recipient_id){
  const select = `SELECT * FROM relationship
                  WHERE (sender_id = $1 AND recipient_id = $2)
                  OR (recipient_id = $1 AND sender_id = $2)`
  return db.query(select, [sender_id, recipient_id])
}

module.exports.updateFriendshipStatus = function(status, sender_id, recipient_id){
  const update = `UPDATE relationship SET status = $1, sender_id = $2, recipient_id = $3
                  WHERE (sender_id = $2 AND recipient_id = $3)
                  OR (recipient_id = $2 AND sender_id = $3)
                  RETURNING sender_id, recipient_id, status`
  return db.query(update, [status, sender_id, recipient_id])
}

module.exports.getUserFriendlist = function(currentUser){

    const select = `SELECT users.id, users.first, users.last, users.profilepicurl
                  	FROM users
                  	JOIN relationship
                  	ON (sender_id = users.id AND sender_id <> $1)
                  	OR (recipient_id = users.id AND recipient_id <> $1)
                  	WHERE status = ${ACCEPTED}
                  	AND (recipient_id = $1 OR sender_id = $1)`;
    return db.query(select, [currentUser])
}

module.exports.getFriends = function(currentUser) {
  const select =  `SELECT users.id, first, last, profilepicurl, status
                  FROM relationship
                  JOIN users
                  ON (status = ${PENDING} AND recipient_id = $1 AND sender_id = users.id)
                  OR (status = ${ACCEPTED} AND recipient_id = $1 AND sender_id = users.id)
                  OR (status = ${ACCEPTED} AND sender_id = $1 AND recipient_id = users.id)`
  return db.query(select,[currentUser] )
}

module.exports.getUsersByIds = function(arrayOfIds) {
    const query = `SELECT first,last,profilepicurl,id
                  FROM users WHERE id = ANY($1)`;
    return db.query(query, [arrayOfIds]);
}
