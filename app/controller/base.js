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

	nouvelles = [];
	catalogue = [];
	
	news.list()
		.then(function(data){
			nouvelles = data;
			return services.list();
		})
		.then(function(data){
			catalogue = data;
			res.render('index',{ news: nouvelles, services: catalogue });
		})
		.catch(function(err) {
			handleError(req, res);
		});
};


/**
 * GET /account
 * Select current user from database and render view
 */
exports.account = function(req, res) {
	
	user = [];
	
	users.select(req.session.user_id)
		.then(function(data) {
			user = data;
			return services.listOwn(req.session.user_id);
		})
		.then(function(data) {
			user.services = data;
			return transactions.listOwn(req.session.user_id);
		})
		.then(function(data) {
			user.transactions = data;
			user['credit'] = 0;
			for ( transaction in user.transactions ) {
				if ( transaction.from_user_id == req.session.user_id ) {
					user['credit'] -= transaction.cost;
				}
				else {
					user['credit'] += transaction.cost;
				}
				
			}
			res.render('account',{user: user});
		})
		.catch(function (err) {
			handleError(req, res);
		});
};


/**
 * GET /catalogue
 * Select service list on database and render view
 */
exports.catalogue = function(req, res) {
	var promise = services.listOwn(req.session.user_id);
	
	promise.then(function(services) {
		res.render('catalogue',{ services: services });
	}).catch(function(err) {
		handleError(req, res)
	});
};
 
/**
 * GET /update
 * Select user from database and render update view
 */
exports.updateForm = function(req, res) {
	
	var promise = users.select(req.session.user_id);	
	promise.then(function(user) {
		res.render('update', { user: user });
	}).catch(function(err) {
		handleError(req, res)
	});
};
 

/**
 * POST /update
 * Update an user
 */
exports.update = function(req, res) {
	var user_id = parseInt(req.params.id);
	var username = req.body.username;
	var email = req.body.email;
	var phone = req.body.phone;
	
	var promise = users.update(user_id, username,email, phone);
	promise.then(function(user) {
		res.redirect('/account');
	}).catch(function(err) {
		handleError(req, res)
	});	
};

/**
 * GET /addTransaction
 * Add a transaction form
 */
exports.addTransactionForm = function(req, res) {
	
	var promise = users.select(req.session.user_id);	
	promise.then(function(user) {
		res.render('update', { user: user });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * POST /addTransaction
 * Add a transaction
 */
exports.addTransaction = function(req, res) {
	
	var promise = users.select(req.session.user_id);	
	promise.then(function(user) {
		res.render('update', { user: user });
	}).catch(function(err) {
		handleError(req, res)
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
		return users.insert("admin","admin","admin","admin@admin.admin","00.00.00.00");
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
