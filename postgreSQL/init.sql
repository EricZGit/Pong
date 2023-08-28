CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50),
	pass VARCHAR(255),
	status VARCHAR(50),
	pathtoimage VARCHAR(50),
	mail VARCHAR(255),
	twofactorauth BOOLEAN,
	twofactorcode VARCHAR(50),
	score INT,
	rank INT,
	nbofwin INT,
	nbofmatch INT,
	winmatch BOOLEAN,
	uploadavatar BOOLEAN,
	addfriend BOOLEAN,
	createchat BOOLEAN,
	inviteplayer BOOLEAN,
	login42 VARCHAR(50)
);

ALTER TABLE users ADD CONSTRAINT nom_unique UNIQUE (nom);

CREATE TABLE friends (
	iduser INT REFERENCES users(id),
	idfriend INT REFERENCES users(id),
	PRIMARY KEY (iduser, idfriend)
);

CREATE TABLE matchs (
	id SERIAL PRIMARY KEY,
	winner INT REFERENCES users(id),
	loser INT REFERENCES users(id),
	score VARCHAR(50),
	date TIMESTAMP,
	mode VARCHAR(50)
);

CREATE TABLE GROUPCHAT (
	id SERIAL PRIMARY KEY,
	type VARCHAR(50),
	owner INT REFERENCES users(id),
	name VARCHAR(50),
	pass VARCHAR(255)
);
-- ajouter password pour les groupes
ALTER TABLE GROUPCHAT ADD CONSTRAINT chk_channel_type CHECK (type IN ('public', 'private', 'protected'));
ALTER TABLE GROUPCHAT ADD CONSTRAINT name_unique UNIQUE (name);

CREATE TABLE CHANNEL_MEMBERS (
	idgroupchat INT REFERENCES GROUPCHAT(id),
	iduser INT REFERENCES users(id),
	is_admin BOOLEAN,
	is_banned BOOLEAN,
	time_ban TIMESTAMP,
	is_muted BOOLEAN,
	time_mute TIMESTAMP,
	is_kicked BOOLEAN,
	PRIMARY KEY (idgroupchat, iduser)
);

CREATE TABLE BLOCKED (
	iduser INT REFERENCES users(id),
	idblocked INT REFERENCES users(id),
	PRIMARY KEY (iduser, idblocked)
);

CREATE TABLE GROUPMESSAGES (
	id SERIAL PRIMARY KEY,
	iduser INT REFERENCES users(id),
	idgroupchat INT REFERENCES GROUPCHAT(id),
	content VARCHAR(255),
	date TIMESTAMP
);

CREATE TABLE PRIVATECHAT (
	id SERIAL PRIMARY KEY,
	iduser1 INT REFERENCES users(id),
	iduser2 INT REFERENCES users(id)
);

CREATE TABLE PRIVATEMSG (
	id SERIAL PRIMARY KEY,
	idchat INT REFERENCES PRIVATECHAT(id),
	iduser INT REFERENCES users(id),
	content VARCHAR(255),
	date TIMESTAMP
);

CREATE TABLE MATCHREQUEST(
	idasker INT REFERENCES users(id),
	idreceiver INT REFERENCES users(id),
	accepted BOOLEAN,
	PRIMARY KEY (idasker, idreceiver)
);

