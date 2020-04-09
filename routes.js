var main = require('./handlers/main.js'),
	 contest = require('./handlers/contest.js'),
	 //vacation = require('./handlers/vacation.js'),
	// cart = require('./handlers/cart.js'),
	// cartValidation = require('./lib/cartValidation.js');
	// contact = require('./handlers/contact.js'),
	// samples = require('./handlers/sample.js'),
	customerController = require('./controllers/customer.js'),
	dealers = require('./handlers/dealers.js');

module.exports = function(app){
	// miscellaneous routes
	app.get('/', main.home);
	app.get('/about', main.about);
	// customer routes
	customerController.registerRoutes(app);
	// dealers
	app.get('/dealers', dealers.home);
};