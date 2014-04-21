
var flash = {};

/**
 * GET home page
 */
exports.index = function(req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.render('lambersel');
};

/**
 * GET login page
 */
exports.login = function(req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.render('login');
};

/**
 * GET logout
 */
exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/');
};

/**
 * GET dashboard page
 */
exports.dashboard = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('dashboard');
};

/**
 * GET administration
 */
exports.administration = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('dashboard/administration');
};

/**
 * GET users
 */
exports.users = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('dashboard/users');
};

/**
 * GET new user
 */
exports.newUser = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('dashboard/new_user');
};

/**
 * GET databaseReset
 */
exports.databaseReset = function(req, res) {
	flash.type = 'alert-info';
	flash.messages = [{ msg: 'La base de données viens d\'être ré-installée.' }];
	res.render('/dashboard/administration', { flash: flash });
);

/**
 * POST new user
 */
exports.addUser = function(req, res) {
	flash.type = 'alert-info';
	flash.messages = [{ msg: 'Le nouvel utilisateur a été enregistré.' }];
	res.render('dashboard/administration', { flash: flash });
};




/**
 * POST login user
 */
exports.loginUser = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	// for test purpose
	if ( username == 'admin' && password == 'admin' ) {
		req.session.authenticated = true;
		res.redirect('/dashboard');
	}
	else {
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'Désolé, le mot de passe ou le nom d\'utilisateur est érroné.' }];
		res.render('login', { flash: flash });
	}
};