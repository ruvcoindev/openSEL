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
			res.redirect('/');
		}
	};
	
    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
	
		// GET
		self.app.get('/', routes.index);
		self.app.get('/login', routes.login);
		self.app.get('/logout', routes.logout);
		self.app.get('/dashboard', self.restrict, routes.dashboard);
		self.app.get('/dashboard/administration', self.restrict, routes.administration);
		self.app.get('/dashboard/users', self.restrict, routes.users);
		self.app.get('/dashboard/users/new', self.restrict, routes.newUser);
		self.app.get('/dashboard/databaseReset', routes.databaseReset);
		
		// POST
		self.app.post('/login', routes.loginUser);
		self.app.post('/dashboard/users/new', self.restrict, routes.addUser);
		
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        
        self.app = express.createServer();

		//	Setup middleware
		self.app.use(express.static(self.pub));
		self.app.set('views', __dirname + '/views');
		self.app.set('view engine', 'jade');

		self.app.use(express.bodyParser());
		
		// add session support
		self.app.use(express.cookieParser());
		self.app.use(express.session({ secret: 'sel' }));
		
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

