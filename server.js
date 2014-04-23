#!/bin/env node

//  OpenShift sample Node application
var express = require('express');
var routes	= require('./routes');

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
			
		// Public routes
		self.app.get('/', routes.index);
		self.app.get('/login', routes.login);
		
		// Restricted routes
		self.app.get('/logout', self.restrict, routes.logout);
		self.app.get('/catalogue', self.restrict, routes.services);
		self.app.get('/administration', self.restrict, routes.administration);
		
		// User GET routes
		self.app.get('/users', self.restrict, routes.users);
		self.app.get('/users/:id', self.restrict, routes.detailUser);
		self.app.get('/users/:id/delete', self.restrict, routes.deleteUserForm);
		self.app.get('/users/:id/update', self.restrict, routes.updateUserForm);
		self.app.get('/users/add', self.restrict, routes.addUserForm);

		// User POST routes
		self.app.post('/users/add', self.restrict, routes.addUser);
		self.app.post('/users/:id/delete', self.restrict, routes.deleteUser);
		self.app.post('/users/:id/update', self.restrict, routes.updateUser);
		
		// News GET routes
		self.app.get('/news', self.restrict, routes.news);
		self.app.get('/news/:id', self.restrict, routes.detailNews);
		self.app.get('/news/:id/delete', self.restrict, routes.deleteNewsForm);
		self.app.get('/news/:id/update', self.restrict, routes.updateNewsForm);
		self.app.get('/news/add', self.restrict, routes.addNewsForm);
				
		// News POST routes
		self.app.post('/news/add', self.restrict, routes.addNews);
		self.app.post('/news/:id/delete', self.restrict, routes.deleteNews);
		self.app.post('/news/:id/update', self.restrict, routes.updateNews);
		
		
		self.app.get('/databaseReset', self.restrict, routes.databaseReset);
		self.app.get('/offer/new', self.restrict, routes.addOfferForm);
		self.app.get('/request/new', self.restrict, routes.addRequestForm);
		self.app.get('/transaction/new', self.restrict, routes.addTransactionForm);
		
		// POST
		self.app.post('/login', routes.loginUser);
		self.app.post('/offer/new', self.restrict, routes.addOffer);
		self.app.post('/request/new', self.restrict, routes.addRequest);
		self.app.post('/transaction/new', self.restrict, routes.addTransaction);
		
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

