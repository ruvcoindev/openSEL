var pg = require('pg');
var bcrypt = require('bcrypt');
var Q = require('q');
var fs = require('fs');

function Users() {
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
};

/**
 * Create database model
 */
Users.prototype.create = function() {
	var self = this;
	var deferred = Q.defer();
		
	pg.connect(self.databaseURL, function(err, client, done) {
	
		client.query("DROP TABLE IF EXISTS utilisateur", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});

		client.query("DROP TYPE IF EXISTS UTILISATEUR_ROLE CASCADE", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});
		
		client.query("CREATE TYPE UTILISATEUR_ROLE AS ENUM ('admin', 'user', 'moderator')", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
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
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
};

/**
 * SELECT an user from database
 */
Users.prototype.select = function(user_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {

		client.query("SELECT id"
					+ ", username"
					+ ", role"
					+ ", credit"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ " FROM utilisateur "
					+ " WHERE id = $1"
					+ " LIMIT 1", [user_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows[0]);
		});
	});
	return deferred.promise;
};

/**
 * SELECT a list of users from database
 */
Users.prototype.list = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("SELECT id"
					+ ", username"
					+ ", role"
					+ ", credit"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ " FROM utilisateur ", function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});
	});
	return deferred.promise;
};

/**
 * INSERT an user on database
 */
Users.prototype.insert = function(username, role, password) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(password, salt, function(err, hash) {
				client.query("INSERT INTO utilisateur(username, role, password)"
							+ " VALUES($1, $2, $3) RETURNING id", [username, role, hash], function(err, result) {
					done(client);
					if ( err ) deferred.reject(err);
					deferred.resolve();
				});						
			});
		});
	});
	return deferred.promise;
};

/**
 * DELETE an user from database
 */
Users.prototype.remove = function(user_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DELETE FROM utilisateurs"
					+ " WHERE id = $1", [user_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

/**
 * UPDATE an user on database
 */
Users.prototype.update = function(user_id, username, password) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(password, salt, function(err, hash) {
				client.query("UPDATE utilisateurs SET"
							+ " username = $1"
							+ ", passwprd = $2"
							+ ", update_date = NOW()"
							+ " WHERE id = $3", [username, hash, user_id], function(err, result) {
					done(client);
					if ( err ) deferred.reject(err);
					deferred.resolve();
				});
			});
		});
	});
	return deferred.promise;
};


/**
 * Check user password. Return user id if password is ok
 */
Users.prototype.checkPassword = function(username, password) {
	var self = this;
	var deferred = Q.defer();
	
	if ( fs.existsSync('../install.txt') ) {
		deferred.resolve(1);
	}
	else {
		pg.connect(self.databaseURL, function(err, client, done) {
			
			client.query("SELECT id, role, password FROM utilisateur WHERE username = $1 LIMIT 1", [username], function(err, result) {
				done(client);
				if ( err ) deferred.reject(err);
				
				var user = result.rows[0];
				bcrypt.compare(password, result.rows[0].password, function (err, result) {
					if ( result ) deferred.resolve(user);
					else deferred.resolve(false);
				});
			});
		});
	}
	return deferred.promise;
 };
 
 
module.exports = Users;