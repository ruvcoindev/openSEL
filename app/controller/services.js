var Services = require('../entity/services');

var services = new Services();
  
var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
};

/**
 * GET /services
 * Select service list on database and render view
 */
exports.list = function(req, res) {
	services.list();
	
	services.on('error', function() {
		handleError(req, res)
	});
	
	services.on('listDone', function(services) {
		res.setHeader('Content-Type','text/html');
		res.render('services',{ services: services });
	});
};

/**
 * GET /services/:id
 * Select services from database and render view
 */
exports.detail = function(req, res) {
	var service_id = parseInt(req.params.id);
	
	services.select(service_id);
	
	services.on('error', function() {
		handleError(req, res)
	});
	
	services.on('selectDone', function(service) {
		res.setHeader('Content-Type','text/html');
		res.render('services/detail',{ service: service });
	});
};

/**
 * GET /services/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('services/add');
};

/**
 * GET /services/:id/update
 * Select service from database and render update view
 */
exports.updateForm = function(req, res) {
	var service_id = parseInt(req.params.id);
	
	services.select(service_id);	
	services.on('error', function() {
		handleError(req, res)
	});
	services.on('selectDone', function(service) {
		res.setHeader('Content-Type','text/html');
		res.render('services/update', { service: service });
	});
};

/**
 * GET /services/:id/delete
 * Render delete formulaire
 */
exports.removeForm = function(req, res) {
	var service_id = parseInt(req.params.id);
	res.setHeader('Content-Type','text/html');
	res.render('services/delete', {service_id: service_id});
};

/**
 * POST /services/add
 * Add service on database
 */
exports.add = function(req, res) {
	var title = req.body.title;
	var description = req.body.description;
	var type = req.body.type;
	
	services.insert(req.session.user_id, type, title, description) ;
	
	services.on('error', function() {
		handleError(req, res)
	});
	services.on('insertDone', function() {
		res.redirect('/services');
	});
};

/**
 * POST /services/:id/delete
 * Remove service from database
 */
exports.remove = function(req, res) {
	var services_id = parseInt(req.params.id);

	services.remove(services_id);
	
	services.on('error', function() {
		handleError(req, res)
	});
	
	services.on('removeDone', function() {
		res.redirect('/services');
	});
};


/** 
 * POST /services/:id/update
 * Update a service
 */
exports.update = function(req, res) {
	var service_id = parseInt(req.params.id);
	var title = req.body.title;
	var description = req.body.description;
	var type = req.body.type;
	var status = req.body.status;
	
	services.update(service_id, type, status, title, description);

	services.on('error', function() {
		handleError(req, res)
	});
	
	services.on('updateDone', function() {
		res.redirect('/services');
	});
 };
