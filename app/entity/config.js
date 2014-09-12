var pg = require('pg');
var bcrypt = require('bcrypt');
var Q = require('q');
var fs = require('fs');

function Config() {
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
	if (typeof this.databaseURL === "undefined") {
		this.databaseURL = "postgresql://postgres:eilrach@127.0.0.1:5432/postgres";
    };
};


/**
 * Create database model
 */
Config.prototype.create = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("CREATE TABLE config( "
						+ "id SERIAL"
						+ ", key CHARACTER VARYING(64)"
						+ ", value TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() )", function(err) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
}


/**
 * Reset database model
 */
Config.prototype.reset = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS config", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});
		
		client.query("CREATE TABLE config( "
						+ "id SERIAL"
						+ ", key CHARACTER VARYING(64)"
						+ ", value TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() )", function(err) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
}


/**
 * Select a configuration value by id
 */
Config.prototype.select = function(config_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", key"
					+ ", value"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM config"
					+ " WHERE id = $1"
					+ " LIMIT 1", [config_id],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows[0]);
		});	
	});
	
	return deferred.promise;
}


/**
 * Select a configuration value by key
 */
Config.prototype.selectByKey = function(key) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", value"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM config"
					+ " WHERE key = $1"
					+ " LIMIT 1", [key],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows[0]);
		});	
	});
	
	return deferred.promise;
}


/**
 * Select a configuration value
 */
Config.prototype.list = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", key"
					+ ", value"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM config"
					, function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});	
	});
	
	return deferred.promise;
}


/**
 * Insert a configuration key
 */
Config.prototype.insert = function(key, value) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("INSERT INTO config (key, value) VALUES ($1, $2)"
					, [key, value],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
}


/**
 * Update a configuration key
 */
Config.prototype.update = function(config_id, key, value) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("UPDATE config SET"
					+ " key = $1"
					+ ", value = $2"
					+ ", update_date = NOW()"
					+ " WHERE id = $3", [key, value, config_id],function(err, result) {
			
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});	
	});
	
	return deferred.promise;
}


/**
 * Remove a configuration key
 */
Config.prototype.remove = function(config_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("DELETE "
					+ " FROM config"
					+ " WHERE id = $1", [config_id],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});	
	});
	
	return deferred.promise;
}


module.exports = Config;