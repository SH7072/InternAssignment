CREATE DATABASE journals;
\c journals;

CREATE TYPE user_role AS ENUM ('teacher', 'student');

CREATE TABLE users (
  id serial PRIMARY KEY,
  username varchar(255) ,
  password varchar(255), 
  role user_role DEFAULT 'student',
  created_at timestamp DEFAULT current_timestamp,
);

CREATE TABLE journal(
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  student_list text[],
  published timestamp DEFAULT current_timestamp,
  description text,
  files text
  );