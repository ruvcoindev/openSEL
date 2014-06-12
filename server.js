#!/bin/env node

//  OpenShift sample Node application
var express = require('express');

// load controllers
var base = require('./app/controller/base');
var news = require('./app/controller/news');
var users = require('./app/controller/users');
var services = require('./app/controller/services');
var transactions = require('./app/controller/transactions');

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
		
		self.pub = __dirname + '/public';
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

	// authentication verification
	self.restrict = function(req, res, next) {
		if ( req.session.authenticated ) {
			next();
		} else {
			req.session.error = 'Vous devez être connecter pour acceder à cette page';
			res.redirect('/login');
		}
	};
	
	self.restrictAdmin = function(req, res, next) {
		if ( req.session.authenticated && req.session.isAdmin ) {
			next();
		} else {
			req.session.error = 'Vous devez être connecter pour acceder à cette page';
			res.redirect('/login');
		}
	};
	
    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
	
		self.app.param(function(name, fn){
		  if (fn instanceof RegExp) {
			return function(req, res, next, val){
			  var captures;
			  if (captures = fn.exec(String(val))) {
				req.params[name] = captures;
				next();
			  } else {
				next('route');
			  }
			}
		  }
		});
	
		self.app.param('id', /^\d+$/);
		
		// TODO restrict this route
		self.app.get('/databaseReset', base.databaseReset);
		
		// Public routes
		self.app.get('/', base.index);
		self.app.get('/login', users.loginForm);
		self.app.post('/login', users.login);
		
		// User Restricted routes
		self.app.get('/logout', self.restrict, users.logout);
		self.app.get('/account', self.restrict, base.account);
		self.app.get('/update', self.restrict, base.updateForm);
		self.app.post('/update', self.restrict, base.update);
		self.app.get('/catalogue', self.restrict, base.catalogue);
		
		// Admin Restricted routes
		self.app.get('/administration', self.restrictAdmin, base.administration);
						
		// User routes
		self.app.get('/users', self.restrictAdmin, users.list);
		self.app.get('/users/:id', self.restrictAdmin, users.detail);
		self.app.get('/users/:id/delete', self.restrictAdmin, users.removeForm);
		self.app.get('/users/:id/update', self.restrictAdmin, users.updateForm);
		self.app.get('/users/add', self.restrictAdmin, users.addForm);
		self.app.post('/users/add', self.restrictAdmin, users.add);
		self.app.post('/users/:id/delete', self.restrictAdmin, users.remove);
		self.app.post('/users/:id/update', self.restrictAdmin, users.update);
		
		// News routes
		self.app.get('/news', self.restrict, news.list);
		self.app.get('/news/:id', self.restrict, news.detail);
		self.app.get('/news/:id/delete', self.restrictAdmin, news.removeForm);
		self.app.get('/news/:id/update', self.restrictAdmin, news.updateForm);
		self.app.get('/news/add', self.restrictAdmin, news.addForm);
		self.app.post('/news/add', self.restrictAdmin, news.add);
		self.app.post('/news/:id/delete', self.restrictAdmin, news.remove);
		self.app.post('/news/:id/update', self.restrictAdmin, news.update);
		
		// Services routes
		self.app.get('/services', self.restrict, services.list);
		self.app.get('/services/:id', self.restrict, services.detail);
		self.app.get('/services/:id/delete', self.restrict, services.removeForm);
		self.app.get('/services/:id/update', self.restrict, services.updateForm);
		self.app.get('/services/add', self.restrict, services.addForm);
		self.app.post('/services/add', self.restrict, services.add);
		self.app.post('/services/:id/delete', self.restrict, services.remove);
		self.app.post('/services/:id/update', self.restrict, services.update);
		
		// Transactions routes
		self.app.get('/transactions', self.restrict, transactions.list);
		self.app.get('/transactions/:id', self.restrict, transactions.detail);
		self.app.get('/transactions/:id/delete', self.restrict, transactions.removeForm);
		self.app.get('/transactions/:id/update', self.restrict, transactions.updateForm);
		self.app.get('/transactions/add', self.restrict, transactions.addForm);
		self.app.post('/transactions/add', self.restrict, transactions.add);
		self.app.post('/transactions/:id/delete', self.restrict, transactions.remove);
		self.app.post('/transactions/:id/update', self.restrict, transactions.update);		
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        
        self.app = express();

		//	Setup middleware
		self.app.use(express.static(self.pub));
		self.app.set('views', __dirname + '/views');
		self.app.set('view engine', 'jade');

		self.app.use(express.bodyParser());
		
		// add session support
		self.app.use(express.cookieParser());
		self.app.use(express.session({ secret: 'sel' }));
		self.app.use(function(req, res, next) {
			var err = req.session.error, 
				msg = req.session.success;
				
			delete req.session.error;
			delete req.session.success;
			
			res.locals.message = '';
			if (err) res.locals.message = err;
			if (msg) res.locals.message = msg;
			
			res.locals.authenticated = req.session.authenticated;
			res.locals.user_id = req.session.user_id;
			res.locals.isAdmin = req.session.isAdmin;
			next();
		});
		
		self.app.use(self.app.router);
		
		self.createRoutes();
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

