var fs = require('fs');

var flash = {};

var Config = require('../entity/config');
var Users = require('../entity/users');
var News = require('../entity/news');
var Services = require('../entity/services');
var Transactions = require('../entity/transactions');

var config = new Config();
var news = new News();
var users = new Users();
var services = new Services();
var transactions = new Transactions();

var handleError = function(req, res) {
	flash.type = 'alert-error';
	flash.messages = [{ msg: 'Une erreur est survenue.' }];
	res.render('info', { flash: flash });
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
			user.credit = 0;
			user.transactions.forEach(function(transaction) {
				if ( transaction.from_user_id == req.session.user_id ) {
					user.credit -= transaction.cost;
				}
				else {
					user.credit += transaction.cost;
				}
			});
			
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
	var promise = services.list();
	
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
	var user_id = parseInt(req.session.user_id);
	var email = req.body.email;
	var phone = req.body.phone;
	
	var promise = users.update(user_id, email, phone);
	promise.then(function(user) {
		res.redirect('/account');
	}).catch(function(err) {
		console.log(err);
		handleError(req, res)
	});	
};


/**
 * GET /updatePassword
 * Render update password form
 */
exports.updatePasswordForm = function(req, res) {
	res.render('updatePassword');
};



/**
 * POST /updatePassword
 * Update an user password
 */
exports.updatePassword = function(req, res) {
	var user_id = parseInt(req.session.user_id);
	var newPassword = req.body.new_password;
	var newPasswordCheck = req.body.new_password_check;
	
	if ( newPassword == newPasswordCheck )
	{
		users.updatePassword(user_id, newPassword)
		.then(function(user) {
			flash.type = 'alert-info';
			flash.messages = [{ msg: 'Votre nouveau mot de passe a été enregistré.' }];
			res.render('info', { flash: flash });
		}).catch(function(err) {
			console.log(err);
			handleError(req, res)
		});	
	}
	else
	{
		flash.type = 'alert-error';
		flash.messages = [{ msg: 'Les mots de passe ne sont pas identiques. Veuillez réessayer.' }];
		res.render('updatePassword', { flash: flash });
	}
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
 * GET /databaseUpdate
 * for update database without loose data
 */
exports.databaseUpdate = function(req, res) {

	config.create()
	.then(function() {
		return users.create();
	})
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
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'La base de donnée viens d\'être mise à jour.' }];
		res.render('administration', { flash: flash });	
	})
	.catch(function(err) {
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'La base de donnée viens d\'être mise à jour.' }];
		res.render('administration', { flash: flash });	
	});
};


/**
 * GET /databaseReset
 * for reset the database
 */
exports.databaseReset = function(req, res) {

	config.reset()
	.then(function() {
		return users.reset();
	})
	.then(function() {
		return news.reset();
	})
	.then(function() {
		return services.reset();
	})
	.then(function() {
		return transactions.reset();
	})
	.then(function() {
		return users.insert("admin","admin","admin","admin@admin.admin","00.00.00.00");
	})
	.then(function() {
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'La base de donnée viens d\'être mise à jour.' }];
		res.render('administration', { flash: flash });	
	})
	.catch(function(err) {
		handleError(req, res);
	});
};


/**
 * GET /databaseSave
 * Get a database save
 */
exports.databaseSave = function(req, res) {
	res.render('administration');
};

/**
 * GET /databaseReset
 * for reset the database
 */
exports.databaseRestore = function(req, res) {
	res.render('administration');
};