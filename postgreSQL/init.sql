CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50),
	status VARCHAR(50),
	pathtoimage VARCHAR(50),
	twofactorauth BOOLEAN,
	nbofwin INT,
	nbofmatch INT
);
ALTER TABLE users ADD CONSTRAINT nom_unique UNIQUE (nom);

CREATE TABLE friends (
	iduser INT REFERENCES users(id),
	idfriend INT REFERENCES users(id),
	PRIMARY KEY (iduser, idfriend)
);

CREATE TABLE matchs (
	id INT PRIMARY KEY,
	iduser1 INT REFERENCES users(id),
	iduser2 INT REFERENCES users(id),
	winner INT REFERENCES users(id),
	loser INT REFERENCES users(id),
	date TIMESTAMP,
	mode VARCHAR(50)
);

CREATE TABLE GROUPCHAT (
	id INT PRIMARY KEY,
	type VARCHAR(50),
	owner INT REFERENCES users(id),
	name VARCHAR(50)
);

ALTER TABLE GROUPCHAT ADD CONSTRAINT chk_channel_type CHECK (type IN ('public', 'private', 'protected'));
ALTER TABLE GROUPCHAT ADD CONSTRAINT name_unique UNIQUE (name);

CREATE TABLE CHANNEL_MEMBERS (
	idgroupchat INT REFERENCES GROUPCHAT(id),
	iduser INT REFERENCES users(id),
	is_admin BOOLEAN,
	is_banned BOOLEAN,
	is_muted BOOLEAN,
	PRIMARY KEY (idgroupchat, iduser)
);

CREATE TABLE BLOCKED (
	iduser INT REFERENCES users(id),
	idblocked INT REFERENCES users(id),
	PRIMARY KEY (iduser, idblocked)
);

CREATE TABLE GROUPMESSAGES (
	id INT PRIMARY KEY,
	iduser INT REFERENCES users(id),
	idgroupchat INT REFERENCES GROUPCHAT(id),
	content VARCHAR(255),
	date TIMESTAMP
);

CREATE TABLE PRIVATEMSG (
	id INT PRIMARY KEY,
	idsender INT REFERENCES users(id),
	idposter INT REFERENCES users(id),
	content VARCHAR(255),
	date TIMESTAMP
);
