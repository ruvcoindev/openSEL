var pg = require('pg');
var Q = require('q');

function Transactions() {
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
};

/**
 * Create database model
 */
Transactions.prototype.create = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS transactions", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});

		client.query("CREATE TABLE transactions( "
						+ "id SERIAL"
						+ ", cost INTEGER"
						+ ", service_id INTEGER"
						+ ", from_user_id INTEGER"
						+ ", to_user_id INTEGER"
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
 * SELECT a transaction from database
 */
Transactions.prototype.select = function(transaction_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", cost"
					+ ", service_id"
					+ ", from_user_id"
					+ ", to_user_id"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM transactions"
					+ " WHERE id = $1"
					+ " LIMIT 1", [transaction_id],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows[0]);
		});
	});
	return deferred.promise;
};

/**
 * SELECT a list of transactions from database
 */
Transactions.prototype.list = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", cost"
					+ ", service_id"
					+ ", from_user_id"
					+ ", to_user_id"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM transactions", function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});
	});
	return deferred.promise;
};

/**
 * SELECT a list of transactions from database
 */
Transactions.prototype.listOwn = function(user_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", cost"
					+ ", service_id"
					+ ", from_user_id"
					+ ", to_user_id"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ " FROM transactions "
					+ " WHERE user_id = $1 ", [user_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});
	});
	return deferred.promise;
};

/**
 * INSERT a transaction on database
 */
Transactions.prototype.insert = function(from_user_id, cost, username, service_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("INSERT INTO transactions("
					+ " cost"
					+ ", service_id"
					+ ", from_user_id"
					+ ", to_user_id )"
					+ " SELECT $1, $2, $3, id FROM utilisateur WHERE username = $4", [cost, service_id, from_user_id, username], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

/**
 * DELETE a transaction from database
 */
Transactions.prototype.remove = function(transaction_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("DELETE FROM transactions"
					+ " WHERE id = $1", [transaction_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

/**
 * UPDATE a transaction on database
 */
Transactions.prototype.update = function(transaction_id, cost, service_id, from_user_id, to_user_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("UPDATE transactions SET"
					+ " cost = $1"
					+ ", service_id = $2"
					+ ", from_user_id = $3"
					+ ", to_user_id = $4"
					+ ", update_date = NOW()"
					+ " WHERE id = $5", [cost, service_id, from_user_id, to_user_id, transaction_id], function(err, result) {
					
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

module.exports = Transactions;