var flash = {};
var databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
var pg = require('pg');
var bcrypt = require('bcrypt');

/**
 * GET home page
 */
exports.index = function(req, res) {

	pg.connect(databaseURL, function(err, client, done) {
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.setHeader('Content-Type', 'text/html');
			res.render('index');
			return true;
		};
		
		client.query("SELECT title, content, creation_date FROM nouvelles ORDER BY creation_date DESC LIMIT 10", function(err, result) {
			if ( handleError(err) ) return;
			
			done(client);
			res.setHeader('Content-Type','text/html');
			res.render('index',{ news: result.rows });
		});
	});
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

	pg.connect(databaseURL, function(err, client, done) {

		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.setHeader('Content-Type', 'text/html');
			res.render('index');
			return true;
		};
				
		client.query("SELECT id"
					+ ", username"
					+ ", role"
					+ ", credit"
					+ ", creation_date"
					+ " FROM utilisateur "
					+ " WHERE id = $1"
					+ " LIMIT 1", [req.session.user_id], function(err, result) {
			if ( handleError(err) ) return;
			var user = result.rows[0];		
			
			client.query("SELECT id"
					+ ", title"
					+ ", description"
					+ ", creation_date"
					+ ", type"
					+ " FROM service"
					+ " WHERE user_id = $1", [req.session.user_id], function(err, result) {
				if ( handleError(err) ) return;
				user.services = result.rows;
				
				client.query("SELECT id"
						+ ", count"
						+ ", from_user_id"
						+ ", to_user_id"
						+ ", date"
						+ " FROM transaction"
						+ " WHERE to_user_id = $1"
						+ "    OR from_user_id = $1"
						+ " ORDER BY date DESC", [req.session.user_id], function(err, result) {
					if ( handleError(err) ) return;
					user.transactions = result.rows;
					
					done(client);
					res.setHeader('Content-Type','text/html');
					res.render('account',{ user: user});			
				});
			});
		});
	});
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
 * GET news list
 */
exports.news = function(req, res) {
	pg.connect(databaseURL, function(err, client, done) {
	
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.writeHead(500 , {'content(type': 'text/html'});
			res.end('An error occurred');
			return true;
		};
		
		client.query("SELECT id, title, content, creation_date FROM nouvelles ORDER BY creation_date DESC", function(err, result) {
			if ( handleError(err) ) return;
			
			done(client);
			res.setHeader('Content-Type','text/html');
			res.render('news',{ news: result.rows });
		});
	});
};

/**
 * GET new news
 * for get the new news formulaire
 */
exports.newNews = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('news/new');
};

/**
 * GET new offer form
 */
exports.addOfferForm = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('service/new_offer');
};

/**
 * GET new request form
 */
exports.addRequestForm = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('service/new_request');
};

/**
 * GET new transaction form
 */
exports.addTransactionForm = function(req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('transaction/new');
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
		
		client.query("DROP TABLE IF EXISTS nouvelles", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("DROP TABLE IF EXISTS transaction", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("DROP TABLE IF EXISTS service", function(err) {
			if ( handleError(err) ) return;
		});

		client.query("DROP TYPE IF EXISTS UTILISATEUR_ROLE CASCADE", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("CREATE TYPE UTILISATEUR_ROLE AS ENUM ('admin', 'user', 'moderator')", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("DROP TYPE IF EXISTS NOUVELLES_STATUS CASCADE", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("CREATE TYPE NOUVELLES_STATUS AS ENUM ('hidden', 'publish')", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("DROP TYPE IF EXISTS SERVICE_TYPE CASCADE", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("CREATE TYPE SERVICE_TYPE AS ENUM ('offer', 'request')", function(err) {
			if ( handleError(err) ) return;
		});
		
		client.query("CREATE TABLE nouvelles( "
						+ "id SERIAL"
						+ ", title CHARACTER VARYING(32)"
						+ ", content TEXT"
						+ ", creation_date DATE DEFAULT NOW()"
						+ ", update_date DATE DEFAULT NOW()"
						+ ", status NOUVELLES_STATUS DEFAULT 'hidden'::NOUVELLES_STATUS)", function(err) {
			if ( handleError(err) ) return;						
		});
		
		client.query("CREATE TABLE utilisateur( "
						+ "id SERIAL"
						+ ", password CHARACTER VARYING"
						+ ", username CHARACTER VARYING(24)"
						+ ", role UTILISATEUR_ROLE DEFAULT 'user'::UTILISATEUR_ROLE"
						+ ", credit INTEGER DEFAULT 0"
						+ ", creation_date DATE DEFAULT NOW()"
						+ ", update_date DATE DEFAULT NOW())", function(err) {
			if ( handleError(err) ) return;						
		});
		
		client.query("CREATE TABLE service( "
						+ "id SERIAL"
						+ ", user_id INTEGER"
						+ ", title CHARACTER VARYING(32)"
						+ ", description TEXT"
						+ ", type SERVICE_TYPE DEFAULT 'offer'::SERVICE_TYPE"
						+ ", creation_date DATE DEFAULT NOW()"
						+ ", update_date DATE DEFAULT NOW())", function(err) {
			if ( handleError(err) ) return;						
		});
		
		client.query("CREATE TABLE transaction( "
						+ "id SERIAL"
						+ ", count INTEGER"
						+ ", from_user_id INTEGER"
						+ ", to_user_id INTEGER"
						+ ", date DATE DEFAULT NOW())", function(err) {
			if ( handleError(err) ) return;						
		});
						
		
		// create first admin user with a commun password
		// this password need to be updated just after first installation
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash("admin", salt, function(err, hash) {
				client.query("INSERT INTO utilisateur(username, password, role)"
							+ " VALUES ($1,$2, 'admin'::UTILISATEUR_ROLE)", ["admin",hash], function (err, result) {
								
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
 * POST new News
 */
exports.addNews = function(req, res) {

	var title = req.body.title;
	var content = (req.body.content;
	
	pg.connect(databaseURL, function(err, client, done) {
		var handleError = function(err) {
			if (!err) return false;
			done(client);
			res.writeHead(500 , {'content(type': 'text/html'});
			res.end('An error occurred');
			return true;
		};
		
		client.query("INSERT INTO nouvelles(title, content)"
					+ " VALUES($1,$2)", [title, content], function(err, result) {
			if ( handleError(err) ) return;
			
			done(client);
			res.redirect('/news');
		});
	});
};

/**
 * POST new offer
 */
exports.addOffer = function(req, res) {

};

/**
 * POST new request
 */
exports.addRequest = function(req, res) {

};

/**
 * POST new transaction
 */
exports.addTransaction = function(req, res) {

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
		
		client.query("SELECT id, password FROM utilisateur WHERE username = $1 LIMIT 1", [username], function(err, result) {
			if ( handleError(err) ) return;
			done(client);
			
			var user_id = result.rows[0].id;
			bcrypt.compare(password, result.rows[0].password, function (err, result) {
				if ( result == true ) {
					req.session.user_id = user_id;
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