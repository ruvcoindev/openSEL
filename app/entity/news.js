var pg = require('pg');
var Q = require('q');

function News() {
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
	if (typeof this.databaseURL === "undefined") {
		this.databaseURL = "postgresql://postgres:eilrach@127.0.0.1:5432/postgres";
    };
};

/**
 * Create database model
 */
News.prototype.create = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS nouvelles", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});

		client.query("DROP TYPE IF EXISTS NOUVELLES_STATUS CASCADE", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});
		
		client.query("CREATE TYPE NOUVELLES_STATUS AS ENUM ('hidden', 'publish')", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});

		client.query("CREATE TABLE nouvelles( "
						+ "id SERIAL"
						+ ", title CHARACTER VARYING(64)"
						+ ", content TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", status NOUVELLES_STATUS DEFAULT 'hidden'::NOUVELLES_STATUS)", function(err) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
}

/**
 * SELECT a news from database
  */
News.prototype.select = function(news_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", title"
					+ ", content"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM nouvelles"
					+ " WHERE id = $1"
					+ " LIMIT 1", [news_id],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows[0]);
		});
	});
	
	return deferred.promise;
};

/**
 * SELECT a list of news from database
 * Event error : something is wrong with database
 * Event listDone : news was found on database
 */
News.prototype.list = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", title"
					+ ", content"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM nouvelles",function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});
	});
	
	return deferred.promise;
};

/**
 * INSERT a news on database
 */
News.prototype.insert = function(title, content) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("INSERT INTO nouvelles("
					+ " title"
					+ ", content )"
					+ " VALUES($1,$2) RETURNING id", [title, content], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(done);
		});
	});
	
	return deferred.promise;
};

/**
 * DELETE a news from database
 */
News.prototype.remove = function(news_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("DELETE FROM nouvelles"
					+ " WHERE id = $1", [news_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(done);
		});
	});
	
	return deferred.promise;
};

/**
 * UPDATE a news on database
 */
News.prototype.update = function(news_id, title, content) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("UPDATE nouvelles SET"
					+ " title = $1"
					+ ", content = $2"
					+ ", update_date = NOW()"
					+ " WHERE id = $3", [title, content, news_id], function(err, result) {
					
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(done);
		});
	});
	return deferred.promise;
};

module.exports = News;