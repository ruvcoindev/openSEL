var fs = require('fs');

var flash = {};

var Users = require('../entity/users');
var News = require('../entity/news');
var Services = require('../entity/services');
var Transactions = require('../entity/transactions');

var news = new News();
var users = new Users();
var services = new Services();
var transactions = new Transactions();

var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
};

/**
 * GET /
 * Load news and render index
 */
exports.index = function(req, res) {
			
	var promise = news.list();
	
	promise.then(function(news) {
		res.render('index',{ news: news });
	}).catch(function(err) {
		handleError(req, res);
	});
};
 
/**
 * GET /administration
 * Render admin view
 */
exports.administration = function(req, res) {
	res.render('administration');
};


/**
 * GET /databaseReset
 * for reset the database
 */
exports.databaseReset = function(req, res) {

	users.create()
	.then(function() {
		return news.create();
	})
	.then(function() {
		return services.create();
	})
	.then(function() {
		return transactions.create();
	})
	.then(function() {
		return users.insert("admin","admin","admin");
	})
	.then(function() {
		fs.unlink("/app/install.txt");
	
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'La base de donnée viens d\'être ré-installée.' }];
		res.render('administration', { flash: flash });	
	})
	.catch(function(err) {
		handleError(req, res);
	});
};
