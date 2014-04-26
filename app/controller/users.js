var Users = require('../entity/users');
var users = new Users();

var handleError = function(req, res) {
	res.writeHead(500 , {'content(type': 'text/html'});
	res.end('An error occurred');
};

/**
 * GET /login
 * Render login view
 */
exports.loginForm = function(req, res) {
	res.render('login');
};

/**
 * GET logout
 * Destroy user session and redirect to index
 */
exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/');
};

/**
 * POST /login
 * Create user session
 */
exports.login = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	users.checkPassword(username, password);
	
	users.on('passwordOk', function(user_id) {
		req.session.user_id = user_id;
		req.session.authenticated = true;
		res.redirect('/');
	});
	
	users.on('passwordKo', function() {
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'Désolé, le mot de passe et/ou le nom d\'utilisateur sont éronnés.' }];
		res.render('login', { flash: flash });
	});
	
	users.on('error', function() {
		handleError(req, res);
	});
};


/**
 * GET /users
 * Select users list on database and render view
 */
exports.list = function(req, res) {
	var users = users.list();
	res.render('users',{ users: users });
};

/**
 * GET /users/:id
 * Select news from database and render view
 */
exports.detail = function(req, res) {
	var user_id = parseInt(req.params.id);
	
	var user = users.select(user_id);
	res.render('users/detail',{user: user});
};

/**
 * GET /users/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.render('news/add');
};

/**
 * GET /users/:id/update
 * Select user from database and render update view
 */
exports.updateForm = function(req, res) {
	var user_id = parseInt(req.params.id);
	
	var user = users.select(user_id);	
	res.render('users/update', { user: user });
};

/**
 * GET /users/:id/delete
 * Render delete formulaire
 */
exports.removeForm = function(req, res) {
	var user_id = parseInt(req.params.id);
	res.render('users/delete', {user_id: user_id});
};


/**
 * POST /users
 * Add an user on database
 */
exports.add = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	users.insert(username, password);
	res.redirect('/users');
};

/**
 * POST /users/:id/delete
 * Remove an user from database
 */
exports.remove = function(req, res) {
	var user_id = parseInt(req.params.id);
	
	users.remove(user_id);
	res.redirect('/users');
};


/**
 * POST /users/:id/update
 * Update an user
 */
exports.update = function(req, res) {
	var user_id = parseInt(req.params.id);
	var username = req.body.username;
	var password = req.body.password;

	users.update(user_id, username, password);
	res.redirect('/users');
};
