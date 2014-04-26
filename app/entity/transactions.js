var pg = require('pg');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Transactions = function() {
    var self = this;
	self.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
};
util.inherits(Transactions, EventEmitter);

/**
 * Create database model
 * Event error : something is wrong with database
 * Event createDone : transactions database model is create
 */
Transactions.prototype.create = function() {
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS transactions", function(err) {
			if ( err ) {done(client);self.emit('error');}
		});

		client.query("CREATE TABLE transactions( "
						+ "id SERIAL"
						+ ", cost INTEGER"
						+ ", service_id INTEGER"
						+ ", from_user_id INTEGER"
						+ ", to_user_id INTEGER"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() )", function(err) {
			client(done);
			if ( err ) self.emit('error');
			self.emit('createDone');
		});
	});
}

/**
 * SELECT a transaction from database
 * Event error : something is wrong with database
 * Event selectDone : transaction was found on database
 */
Transactions.prototype.select = function(transaction_id) {
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
			if ( err ) self.emit('error');
			self.emit('selectDone', result.rows[0]);
		});
	});
};

/**
 * SELECT a list of transactions from database
 * Event error : something is wrong with database
 * Event listDone : transactions was found on database
 */
Transactions.prototype.list = function() {
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
			if ( err ) self.emit('error');
			self.emit('listDone', result.rows);
		});
	});
};

/**
 * INSERT a transaction on database
 * Event error : something is wrong with database
 * Event insertDone : transaction was insert on database
 */
Transactions.prototype.insert = function(cost, service_id, from_user_id, to_user_id) {
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("INSERT INTO transactions("
					+ " cost"
					+ ", service_id"
					+ ", from_user_id"
					+ ", to_user_id )"
					+ " VALUES($1,$2,$3,$4) RETURNING id", [cost, service_id, from_user_id, to_user_id], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('insertDone');
		});
	});
};

/**
 * DELETE a transaction from database
 * Event error : something is wrong with database
 * Event removeDone : transaction was delete from database
 */
Transactions.prototype.remove = function(transaction_id) {
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("DELETE FROM transactions"
					+ " WHERE id = $1", [transaction_id], function(err, result) {
			done(client);
			if ( err ) self.emit('error');
			self.emit('removeDone');
		});
	});
};

/**
 * UPDATE a transaction on database
 * Event error : something is wrong with database
 * Event updateDone : transaction was update on database
 */
Transactions.prototype.update = function(transaction_id, cost, service_id, from_user_id, to_user_id) {
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("UPDATE transactions SET"
					+ " cost = $1"
					+ ", service_id = $2"
					+ ", from_user_id = $3"
					+ ", to_user_id = $4"
					+ ", update_date = NOW()"
					+ " WHERE id = $5", [cost, service_id, from_user_id, to_user_id, transaction_id], function(err, result) {
					
			done(client);
			if ( err ) self.emit('error');
			self.emit('updateDone');
		});
	});
};

module.exports = Transactions;