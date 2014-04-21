
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
	req.render('dashboard');
};

/**
 * POST login user
 */
exports.loginUser = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	// fo test purpose
	if ( username == 'admin' && password == 'admin' ) {
		req.session.authenticated = true;
		res.redirect('/dashboard');
	}
	else {
		flash.type = 'alert-info';
		flash.messages = [{ msg: 'You have registered, but have not yet verified your account.  Please check your email for registration confirmation and click on the provided link to verify your account.' }];
		res.render('login', { flash: flash });
	}
};