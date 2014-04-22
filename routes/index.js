var flash = {};
var databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
var pg = require('pg');
var bcrypt = require('bcrypt');

/**
 * GET home page
 */
exports.index = function(req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.render('index');
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
 * GET account page
 */
exports.account = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('account');
};

/**
 * GET services list page
 */
exports.services = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('services');
};

/**
 * GET administration
 */
exports.administration = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('administration');
};

/**
 * GET users
 * for get the user list
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
			res.render('users',{ users: result.rows });
		});
	});
};

/**
 * GET new user
 * for get the new user formulaire
 */
exports.newUser = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('users/new');
};

/**
 * GET databaseReset
 * for reset the database
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

		//  create database structure
		client.query("DROP TABLE IF EXISTS utilisateur", function(err) {
			if ( handleError(err) ) return;
		});

		client.query("CREATE TABLE utilisateur( "
						+ "id SERIAL"
						+ ", password CHARACTER VARYING"
						+ ", username CHARACTER VARYING(24) )", function(err) {
			if ( handleError(err) ) return;						
		});
		
		// create first user with a commun password
		// this password need to be updated just after first installation
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash("admin", salt, function(err, hash) {
				client.query("INSERT INTO utilisateur(username, password)"
							+ " VALUES ($1,$2)", ["admin",hash], function (err, result) {
								
					if ( handleError(err) ) return;
					
					done(client);
					flash.type = 'alert-info';
					flash.messages = [{ msg: 'La base de donnée viens d\'être ré-installée.' }];
					res.render('administration', { flash: flash });						
				});
			});
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
							+ " VALUES($1, $2)", [username, hash], function(err, result) {
							
					if ( handleError(err) ) return;
					
					done(client);
					flash.type = 'alert-info';
					flash.messages = [{ msg: 'Le nouvel utilisateur a été enregistré.' }];
					res.render('administration', { flash: flash });
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
	
	// get a pg client from the connection pool
	pg.connect(databaseURL, function(err, client, done) {
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.writeHead(500 , {'content(type': 'text/html'});
			res.end('An error occurred');
			return true;
		};
		
		client.query("SELECT password FROM utilisateur WHERE username = $1 LIMIT 1", [username], function(err, result) {
			if ( handleError(err) ) return;
			done(client);
			
			bcrypt.compare(password, result.rows[0].password, function (err, result) {
				if ( result == true ) {
					req.session.authenticated = true;
					res.redirect('/');
				}
				else {
					flash.type = 'alert-info';
					flash.messages = [{ msg: 'Désolé, le mot de passe et/ou le nom d\'utilisateur sont éronnés.' }];
					res.render('login', { flash: flash });
				}
			});
		});
	});
};