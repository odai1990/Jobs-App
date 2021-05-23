DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
	id serial PRIMARY KEY,
	title VARCHAR (255) ,
	company VARCHAR (255) ,
	location VARCHAR (255) ,
	url VARCHAR (255),
	description text

);