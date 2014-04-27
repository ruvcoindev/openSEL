var News = require('../entity/news');

var news = new News();
  
var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
};

/**
 * GET /news
 * Select news list on database and render view
 */
exports.list = function(req, res) {
	var promise = news.list();
	
	promise.then(function(news) {
		res.render('news',{ news: news });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /news/:id
 * Select news from database and render view
 */
exports.detail = function(req, res) {
	var news_id = parseInt(req.params.id);
	
	var promise = news.select(news_id);
	
	promise.then(function(news) {
		res.render('news/detail',{ nouvelle: news });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /news/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.render('news/add');
};

/**
 * GET /news/:id/update
 * Select news from database and render update view
 */
exports.updateForm = function(req, res) {
	var news_id = parseInt(req.params.id);
	
	var promise = news.select(news_id);	
		
	promise.then(function(news) {
		res.render('news/update', { news: news });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /news/:id/delete
 * Render delete formulaire
 */
exports.removeForm = function(req, res) {
	var news_id = parseInt(req.params.id);
	res.render('news/delete', {news_id: news_id});
};

/**
 * POST /news/add
 * Add news on database
 */
exports.add = function(req, res) {

	var title = req.body.title;
	var content = req.body.content;
	
	var promise = news.insert(title, content);
	
	promise.then(function() {
		res.redirect('/news');
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * POST /news/:id/delete
 * Remove news from database
 */
exports.remove = function(req, res) {
	var news_id = parseInt(req.params.id);

	var promise = news.remove(news_id);
	
	promise.then(function() {
		res.redirect('/news');
	}).catch(function(err) {
		handleError(req, res)
	});
};


/** 
 * POST /news/:id/update
 */
exports.update = function(req, res) {
	var news_id = parseInt(req.params.id);
	var title = req.body.title;
	var content = req.body.content;
	
	var promise = news.update(news_id, title, content);
	
	promise.then(function() {
		res.redirect('/news');
	}).catch(function(err) {
		handleError(req, res)
	});
 };
