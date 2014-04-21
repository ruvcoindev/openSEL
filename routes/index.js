
var flash = {};
var databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
var pg = require('pg');
var bcrypt = require('bcrypt');

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
	// get a pg client from the connection pool
	pg.connect(databaseURL, function(err, client, done) {
	
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.writeHead(500 , {'content(type': 'text/html'});
			res.end('An error occurred');
			return true;
		};
		
		client.query("SELECT id, username FROM utilisateur", function(err, result) {
			if ( handleError(err) ) return;
			
			done(client);
			res.setHeader('Content-Type','text/html');
			res.render('dashboard/users',{ users: result.rows });
		});
	});
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
	
	// get a pg client from the connection pool
	pg.connect(databaseURL, function(err, client, done) {
		
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.writeHead(500 , {'content(type': 'text/html'});
			res.end('An error occurred');
			return true;
		};
		
		client.query("DROP TABLE IF EXISTS utilisateur", function(err) {
			if ( handleError(err) ) return;
		});

		client.query("CREATE TABLE utilisateur( "
						+ "id SERIAL"
						+ ", password CHARACTER VARYING"
						+ ", username CHARACTER VARYING(24) )", function(err, result) {
						
			if ( handleError(err) ) return;
			
			done(client);
			flash.type = 'alert-info';
			flash.messages = [{ msg: 'La base de donnée viens d\'être ré-installée.' }];
			res.render('dashboard/administration', { flash: flash });						
		});
	});
};

/**
 * POST new user
 */
exports.addUser = function(req, res) {

	var username = req.body.username;
	var password = req.body.password;
	
	// get a pg client from the connection pool
	pg.connect(databaseURL, function(err, client, done) {
	
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.writeHead(500 , {'content(type': 'text/html'});
			res.end('An error occurred');
			return true;
		};
		
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(password, salt, function(err, hash) {
				client.query("INSERT INTO utilisateur(username, password)"
							+ " VALUES($1, $2)", [username, password], function(err, result) {
							
					if ( handleError(err) ) return;
					
					done(client);
					flash.type = 'alert-info';
					flash.messages = [{ msg: 'Le nouvel utilisateur a été enregistré.' }];
					res.render('dashboard/administration', { flash: flash });
				});						
			});
		});
	});
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
		flash.messages = [{ msg: 'Désolé, le mot de passe et/ou le nom d\'utilisateur sont éronnés.' }];
		res.render('login', { flash: flash });
	}
};