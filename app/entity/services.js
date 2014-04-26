var pg = require('pg');
var EventEmitter = require('events').EventEmitter;
var util = require('util);

var Services = function() {
    var self = this;
	self.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
};
util.inherits(Services, EventEmitter);

/**
 * Create database model
 * Event error : something is wrong with database
 * Event createDone : services database model is create
 */
Services.prototype.create = function() {
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS services", function(err) {
			if ( err ) {done(client);self.emit('error');}
		});

		client.query("DROP TYPE IF EXISTS SERVICES_TYPE CASCADE", function(err) {
			if ( err ) {done(client);self.emit('error');}
		});
		
		client.query("CREATE TYPE SERVICES_TYPE AS ENUM ('offer', 'request')", function(err) {
			if ( err ) {done(client);self.emit('error');}
		});
		
		client.query("DROP TYPE IF EXISTS SERVICES_STATUS CASCADE", function(err) {
			if ( err ) {done(client);self.emit('error');}
		});
		
		client.query("CREATE TYPE SERVICES_STATUS AS ENUM ('enable', 'disable')", function(err) {
			if ( err ) {done(client);self.emit('error');}
		});

		client.query("CREATE TABLE services( "
						+ "id SERIAL"
						+ ", title CHARACTER VARYING(32)"
						+ ", description TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", type SERVICES_TYPE DEFAULT 'offer'::SERVICES_TYPE"
						+ ", status SERVICES_STATUS DEFAULT 'disable'::SERVICES_STATUS)", function(err) {
			client(done);
			if ( err ) self.emit('error');
			self.emit('createDone');
		});
	});
}

/**
 * SELECT a service from database
 * Event error : something is wrong with database
 * Event selectDone : service was found on database
 */
Services.prototype.select = function(service_id) {
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", title"
					+ ", description"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ ", type"
					+ ", status"
					+ " FROM services"
					+ " WHERE id = $1"
					+ " LIMIT 1", [service_id],function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('selectDone', result.rows[0]);
		});
	});
};

/**
 * SELECT a list of services from database
 * Event error : something is wrong with database
 * Event listDone : services was found on database
 */
Services.prototype.list = function() {
	pg.connect(databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", title"
					+ ", description"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ ", type"
					+ ", status"
					+ " FROM services", function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('listDone', result.rows);
		});
	});
};

/**
 * INSERT a service on database
 * Event error : something is wrong with database
 * Event insertDone : services was insert on database
 */
Services.prototype.insert = function(user_id, type, title, description) {
	pg.connect(databaseURL, function(err, client, done) {
		client.query("INSERT INTO services("
					+ " user_id"
					+ ", type"
					+ ", title"
					+ ", description )"
					+ " VALUES($1,$2,$3,$4) RETURNING id", [user_id, type, title, description], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('insertDone');
		});
	});
};

/**
 * DELETE a service from database
 * Event error : something is wrong with database
 * Event removeDone : service was delete from database
 */
Services.prototype.remove = function(service_id) {
	pg.connect(databaseURL, function(err, client, done) {
		client.query("DELETE FROM services"
					+ " WHERE id = $1", [service_id], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('removeDone');
		});
	});
};

/**
 * UPDATE a service on database
 * Event error : something is wrong with database
 * Event updateDone : service was update on database
 */
Services.prototype.update = function(service_id, type, status, title, description) {
	pg.connect(databaseURL, function(err, client, done) {
		client.query("UPDATE services SET"
					+ " type = $1"
					+ " status = $2"
					+ " title = $3"
					+ ", description = $4"
					+ ", update_date = NOW()"
					+ " WHERE id = $5", [type, status, title, description, service_id], function(err, result) {
					
			done(client);
			if ( err ) self.emit('error');
			self.emit('updateDone');
		});
	});
};

module.exports = Services;