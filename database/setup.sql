DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS relationship;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  first VARCHAR(300) not null,
  last VARCHAR(300) not null,
  email VARCHAR(300) not null UNIQUE,
  password VARCHAR(300) not null,
  bio TEXT not null,
  profilepicurl VARCHAR(300) not null,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE relationship(
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  status INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
