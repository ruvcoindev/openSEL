﻿var Services = require('../entity/services');

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
	var promise = services.list();
	
	promise.then(function(services) {
		res.render('services',{ services: services });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /services/:id
 * Select services from database and render view
 */
exports.detail = function(req, res) {
	var service_id = parseInt(req.params.id);
	
	var promise = services.select(service_id);

	promise.then(function(service) {
		res.render('services/detail',{ service: service });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /services/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.render('services/add');
};

/**
 * GET /services/:id/update
 * Select service from database and render update view
 */
exports.updateForm = function(req, res) {
	var service_id = parseInt(req.params.id);
	
	var promise = services.select(service_id);	
	
	promise.then(function(service) {
		res.render('services/update', { service: service });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /services/:id/delete
 * Render delete formulaire
 */
exports.removeForm = function(req, res) {
	var service_id = parseInt(req.params.id);
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
	
	var promise = services.insert(req.session.user_id, type, title, description) ;
	
	promise.then(function(service) {
		res.redirect('/services');
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * POST /services/:id/delete
 * Remove service from database
 */
exports.remove = function(req, res) {
	var services_id = parseInt(req.params.id);

	var promise = services.remove(services_id);
	
	promise.then(function(service) {
		res.redirect('/services');
	}).catch(function(err) {
		handleError(req, res)
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
	
	var promise = services.update(service_id, type, status, title, description);
	
	promise.then(function(service) {
		res.redirect('/services');
	}).catch(function(err) {
		handleError(req, res)
	});
 };
