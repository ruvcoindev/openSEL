var Transactions = require('../entity/transactions');

var transactions = new Transactions();
  
var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
};

/**
 * GET /transactions
 * Select transaction list on database and render view
 */
exports.list = function(req, res) {
	var promise = transactions.list();
	
	promise.then(function(transactions) {
		res.render('transactions',{ transactions: transactions });
	}).catch(function(err) {
		handleError(req, res)
	});	
};

/**
 * GET /transactions/:id
 * Select transactions from database and render view
 */
exports.detail = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	
	var promise = transactions.select(transaction_id);
	
	promise.then(function(transaction) {
		res.render('transactions/detail',{ transaction: transaction });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /transactions/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.render('transactions/add');
};

/**
 * GET /transactions/:id/update
 * Select transaction from database and render update view
 */
exports.updateForm = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	
	var promise = transactions.select(transaction_id);	
		
	promise.then(function(transaction) {
		res.render('transactions/update', { transactions: transaction });
	}).catch(function(err) {
		handleError(req, res)
	});	
};

/**
 * GET /transactions/:id/delete
 * Render delete formulaire
 */
exports.removeForm = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	res.render('transactions/delete', {transaction_id: transaction_id});
};

/**
 * POST /transaction/add
 * Add transaction on database
 */
exports.add = function(req, res) {
	var cost = req.body.cost;
	var username = req.body.username;
	var service_id = req.body.service_id;
		
	var promise = transactions.insert(req.session.user_id, cost, username, service_id);
	
	promise.then(function() {
		res.redirect('/users/'+user_id);
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * POST /transactions/:id/delete
 * Remove transaction from database
 */
exports.remove = function(req, res) {
	var transaction_id = parseInt(req.params.id);

	var promise = transactions.remove(transaction_id);
	
	promise.then(function() {
		res.redirect('/transactions');
	}).catch(function(err) {
		handleError(req, res)
	});
};


/** 
 * POST /transactions/:id/update
 * Update a transaction
 */
exports.update = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	var cost = req.body.cost;
	var from_user_id = req.body.from_user_id;
	var to_user_id = req.body.to_user_id;
	
	var promise = transactions.update(transaction_id, cost, from_user_id, to_user_id);

	promise.then(function() {
		res.redirect('/transactions');
	}).catch(function(err) {
		handleError(req, res)
	});
 };
