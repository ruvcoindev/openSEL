var pg = require('pg');
var bcrypt = require('bcrypt');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Users() {
	EventEmitter.call(this);
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
};

util.inherits(Users, EventEmitter);

/**
 * Create database model
 */
Users.prototype.create = function() {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {
	
		client.query("DROP TABLE IF EXISTS utilisateur", function(err) {
			if ( err ) {done(client); self.emit('error');}
		});

		client.query("DROP TYPE IF EXISTS UTILISATEUR_ROLE CASCADE", function(err) {
			if ( err ) {done(client); self.emit('error');}
		});
		
		client.query("CREATE TYPE UTILISATEUR_ROLE AS ENUM ('admin', 'user', 'moderator')", function(err) {
			if ( err ) {done(client); self.emit('error');}
		});

		client.query("CREATE TABLE utilisateur( "
						+ "id SERIAL"
						+ ", password CHARACTER VARYING"
						+ ", username CHARACTER VARYING(24)"
						+ ", role UTILISATEUR_ROLE DEFAULT 'user'::UTILISATEUR_ROLE"
						+ ", credit INTEGER DEFAULT 0"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW())", function(err) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('createDone');
		});
	});
};

/**
 * SELECT an user from database
 */
Users.prototype.select = function(user_id) {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {

		client.query("SELECT id"
					+ ", username"
					+ ", role"
					+ ", credit"
					+ ", creation_date"
					+ " FROM utilisateur "
					+ " WHERE id = $1"
					+ " LIMIT 1", [user_id], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('selectDone', result.rows[0]);
		});
	});
};

/**
 * SELECT a list of users from database
 */
Users.prototype.list = function() {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("SELECT id"
					+ ", username"
					+ ", role"
					+ ", credit"
					+ ", creation_date"
					+ " FROM utilisateur ", [user_id], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('listDone', result.rows);
		});
	});
};

/**
 * INSERT an user on database
 */
Users.prototype.insert = function(username, password) {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {
		
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(password, salt, function(err, hash) {
				client.query("INSERT INTO utilisateur(username, password)"
							+ " VALUES($1, $2) RETURNING id", [username, hash], function(err, result) {
					done(client);
					if ( err ) self.emit('error');
					self.emit('insertDone');
				});						
			});
		});
	});
};

/**
 * DELETE an user from database
 */
Users.prototype.remove = function(user_id) {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DELETE FROM utilisateurs"
					+ " WHERE id = $1", [user_id], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('removeDone');
		});
	});
};

/**
 * UPDATE an user on database
 */
Users.prototype.update = function(user_id, username, password) {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {
		
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(password, salt, function(err, hash) {
				client.query("UPDATE utilisateurs SET"
							+ " username = $1"
							+ ", passwprd = $2"
							+ ", update_date = NOW()"
							+ " WHERE id = $3", [username, hash, user_id], function(err, result) {
					done(client);
					if ( err ) self.emit('error');
					self.emit('updateDone');
				});
			});
		});
	});
};


/**
 * Check user password. Return user id if password is ok
 */
Users.prototype.checkPassword = function(username, password) {
	var self = this;
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("SELECT id, password FROM utilisateur WHERE username = $1 LIMIT 1", [username], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			
			var user_id = result.rows[0].id;
			bcrypt.compare(password, result.rows[0].password, function (err, result) {
				if ( result == true ) {
					self.emit('passwordOk', user_id);
				}
				else {
					self.emit('passwordKo');
				}
			});
		});
	});
 };
 
 
module.exports = Users;