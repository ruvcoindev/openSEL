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
 * GET /logout
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
	
	var promise = users.checkPassword(username, password);
	
	promise.then(function(user) {
		if ( user ) {
			req.session.user_id = user.id;
			req.session.authenticated = true;
			if ( user.role == 'admin' ) {
				req.session.isAdmin = true;
				res.redirect('/administration');
			}
			else {
				req.session.isAdmin = false;
				res.redirect('/users/'+user.id);
			}
		} else {
			flash.type = 'alert-info';
			flash.messages = [{ msg: 'Désolé, le mot de passe et/ou le nom d\'utilisateur sont éronnés.' }];
			res.render('login', { flash: flash });
		}
	}).catch(function(err) {
		console.log(err);
		handleError(req, res)
	});
};


/**
 * GET /users
 * Select users list on database and render view
 */
exports.list = function(req, res) {
	var promise = users.list();
	
	promise.then(function(users) {
		res.render('users',{ users: users });
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /users/:id
 * Select user from database and render view
 */
exports.detail = function(req, res) {
	var user_id = parseInt(req.params.id);
	
	var promise = users.select(user_id);
	
	promise.then(function(user) {
		res.render('users/detail',{user: user});
	}).catch(function(err) {
		handleError(req, res)
	});
};

/**
 * GET /users/add
 * Render add formulaire
 */
exports.addForm = function(req, res) {
	res.render('users/add');
};

/**
 * GET /users/:id/update
 * Select user from database and render update view
 */
exports.updateForm = function(req, res) {
	var user_id = parseInt(req.params.id);
	
	var promise = users.select(user_id);	
	promise.then(function(user) {
		res.render('users/update', { user: user });
	}).catch(function(err) {
		handleError(req, res)
	});
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
	var role = req.body.role;
	var email = req.body.email;
	var phone = req.body.phone;
	
	var promise = users.insert(username, role, password, email, phone);
	promise.then(function(user) {
		res.redirect('/users');
	}).catch(function(err) {
		handleError(req, res)
	});	
};

/**
 * POST /users/:id/delete
 * Remove an user from database
 */
exports.remove = function(req, res) {
	var user_id = parseInt(req.params.id);
	
	var promise = users.remove(user_id);
	
	promise.then(function(user) {
		res.redirect('/users');
	}).catch(function(err) {
		handleError(req, res)
	});	
};


/**
 * POST /users/:id/update
 * Update an user
 */
exports.update = function(req, res) {
	var user_id = parseInt(req.params.id);
	var username = req.body.username;
	var email = req.body.email;
	var phone = req.body.phone;
	
	var promise = users.update(user_id, username,email, phone);
	promise.then(function(user) {
		res.redirect('/users/' + user_id);
	}).catch(function(err) {
		handleError(req, res)
	});	
};
