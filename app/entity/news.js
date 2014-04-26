var pg = require('pg');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var News = function() {
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
};
util.inherits(News, EventEmitter);

/**
 * Create database model
 * Event error : something is wrong with database
 * Event createDone : news database model is create
 */
News.prototype.create = function() {
	pg.connect(this.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS nouvelles", function(err) {
			if ( err ) {done(client);this.emit('error');}
		});

		client.query("DROP TYPE IF EXISTS NOUVELLES_STATUS CASCADE", function(err) {
			if ( err ) {done(client);this.emit('error');}
		});
		
		client.query("CREATE TYPE NOUVELLES_STATUS AS ENUM ('hidden', 'publish')", function(err) {
			if ( err ) {done(client);this.emit('error');}
		});

		client.query("CREATE TABLE nouvelles( "
						+ "id SERIAL"
						+ ", title CHARACTER VARYING(32)"
						+ ", content TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", status NOUVELLES_STATUS DEFAULT 'hidden'::NOUVELLES_STATUS)", function(err) {
			client(done);
			if ( err ) this.emit('error');
			this.emit('createDone');
		});
	});
}

/**
 * SELECT a news from database
 * Event error : something is wrong with database
 * Event selectDone : new was found on database
 */
News.prototype.select = function(news_id) {
	pg.connect(this.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", title"
					+ ", content"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM nouvelles"
					+ " WHERE id = $1"
					+ " LIMIT 1", [news_id],function(err, result) {
			done(client);
			if ( err ) this.emit('error');
			this.emit('selectDone', result.rows[0]);
		});
	});
};

/**
 * SELECT a list of news from database
 * Event error : something is wrong with database
 * Event listDone : news was found on database
 */
News.prototype.list = function() {
	pg.connect(this.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", title"
					+ ", content"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM nouvelles",function(err, result) {
			done(client);
			if ( err ) this.emit('error');
			this.emit('listDone', result.rows);
		});
	});
};

/**
 * INSERT a news on database
 * Event error : something is wrong with database
 * Event insertDone : news was insert on database
 */
News.prototype.insert = function(title, content) {
	pg.connect(this.databaseURL, function(err, client, done) {
		client.query("INSERT INTO nouvelles("
					+ " title"
					+ ", content )"
					+ " VALUES($1,$2) RETURNING id", [title, content], function(err, result) {
			done(client);
			if ( err ) this.emit('error');
			this.emit('insertDone');
		});
	});
};

/**
 * DELETE a news from database
 * Event error : something is wrong with database
 * Event removeDone : news was delete from database
 */
News.prototype.remove = function(news_id) {
	pg.connect(this.databaseURL, function(err, client, done) {
		client.query("DELETE FROM nouvelles"
					+ " WHERE id = $1", [news_id], function(err, result) {
			done(client);
			if ( err ) this.emit('error');
			this.emit('removeDone');
		});
	});
};

/**
 * UPDATE a news on database
 * Event error : something is wrong with database
 * Event updateDone : news was update on database
 */
News.prototype.update = function(news_id, title, content) {
	pg.connect(this.databaseURL, function(err, client, done) {
		client.query("UPDATE nouvelles SET"
					+ " title = $1"
					+ ", content = $2"
					+ ", update_date = NOW()"
					+ " WHERE id = $3", [title, content, news_id], function(err, result) {
					
			done(client);
			if ( err ) this.emit('error');
			this.emit('updateDone');
		});
	});
};

module.exports = News;