var Config = require('../entity/config');
var config = new Config();

var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
};

/**
 * GET /config
 * Render configuration view
 */
exports.index = function(req, res) {
	var promise = config.list();
	promise.then(function(config) {
		res.render('config/index', {config: config});
	}).catch(function(err) {
		handleError(req, res)
	});	
};

/**
 * GET /config/reload
 */
exports.reload = function(req, res) {
	res.redirect('/config');
};


/**
 * GET /config/add
 * Render configuration view
 */
exports.addForm = function(req, res) {
	res.render('config/add');
};

/**
 * POST /config/add
 */
exports.add = function(req, res) {

	var key = req.body.key;
	var value = req.body.value;
	
	var promise = config.insert(key, value);
	
	promise.then(function() {
		res.redirect('/config');
	}).catch(function(err) {
		handleError(req, res)
	});

};

/**
 * GET /config/:id/update
 * Render configuration view
 */
exports.updateForm = function(req, res) {
	var config_id = parseInt(req.params.id);
	
	var promise = config.select(config_id);	

	promise.then(function(config) {	
		res.render('config/update', {config: config});
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * POST /config/:id/update
 */
exports.update = function(req, res) {
	var config_id = parseInt(req.params.id);
	var key = req.body.key;
	var value = req.body.value;
	
	var promise = config.update(config_id, key, value);
	
	promise.then(function() {
		res.redirect('/config');
	}).catch(function(err) {
		console.log(err);
		handleError(req, res);
	});
	
};

/**
 * GET /config/:id/delete
 * Render configuration view
 */
exports.removeForm = function(req, res) {
	var config_id = parseInt(req.params.id);
	
	var promise = config.select(config_id);	

	promise.then(function(config) {	
		res.render('config/delete', {config: config});
	}).catch(function(err) {
		handleError(req, res)
	});
};


/**
 * POST /config/:id/delete
 */
exports.remove = function(req, res) {
	var config_id = parseInt(req.params.id);
	
	var promise = config.remove(config_id);	
		promise.then(function(config) {	
		res.redirect('/config');
	}).catch(function(err) {
		handleError(req, res)
	});
};