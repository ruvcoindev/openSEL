var Transactions = require('../entity/transactions');

var transactions = new Transactions();
  
var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
});

/**
 * GET /transactions
 * Select transaction list on database and render view
 */
exports.list = function(req, res) {
	transactions.list();
	
	transactions.on('error', function() {
		handleError(req, res)
	});
	
	transactions.on('listDone', function(transactions) {
		res.setHeader('Content-Type','text/html');
		res.render('transactions',{ transactions: transactions });
	});
};

/**
 * GET /transactions/:id
 * Select transactions from database and render view
 */
exports.detail = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	
	transactions.select(transaction_id);
	
	transactions.on('error', function() {
		handleError(req, res)
	});
	
	transactions.on('selectDone', function(transaction) {
		res.setHeader('Content-Type','text/html');
		res.render('transactions/detail',{ transaction: transaction });
	});
};

/**
 * GET /transactions/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('transactions/add');
};

/**
 * GET /transactions/:id/update
 * Select transaction from database and render update view
 */
exports.updateForm = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	
	transactions.select(transaction_id);	
	transactions.on('error', function() {
		handleError(req, res)
	});
	transactions.on('selectDone', function(transaction) {
		res.setHeader('Content-Type','text/html');
		res.render('transactions/update', { transactions: transaction });
	});
};

/**
 * GET /transactions/:id/delete
 * Render delete formulaire
 */
exports.removeForm = function(req, res) {
	var transaction_id = parseInt(req.params.id);
	res.setHeader('Content-Type','text/html');
	res.render('transactions/delete', {transaction_id: transaction_id});
};

/**
 * POST /transaction/add
 * Add transaction on database
 */
exports.add = function(req, res) {

	var cost = req.body.cost;
	var from_user_id = req.body.from_user_id;
	var to_user_id = req.body.to_user_id;
		
	transactions.insert(cost, from_user_id, to_user_id);
	
	transactions.on('error', function() {
		handleError(req, res)
	});
	transactions.on('insertDone', function() {
		res.redirect('/transactions');
	});
};

/**
 * POST /transactions/:id/delete
 * Remove transaction from database
 */
exports.remove = function(req, res) {
	var transaction_id = parseInt(req.params.id);

	transactions.remove(transaction_id);
	
	transactions.on('error', function() {
		handleError(req, res)
	});
	
	transactions.on('removeDone', function() {
		res.redirect('/transactions');
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
	
	transactions.update(transaction_id, cost, from_user_id, to_user_id);

	transactions.on('error', function() {
		handleError(req, res)
	});
	
	transactions.on('updateDone', function() {
		res.redirect('/transactions');
	});
 };
