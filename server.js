var http = require('http'),
	https = require('https'),
	Q = require('q'),
	Dealer = require('./models/dealer.js');

var express = require('express');

var credentials = require('./credentials.js');

var app = express();


// var config = require('./config.json');

var mongoose = require('mongoose');
//var connect = require('connect');
var flash = require('flash');

var fs = require('fs');
var vhost = require('vhost');

var Rest = require('connect-rest');

var admin = express.Router();
var res = express.response;
app.use(vhost('admin.*', admin));
// Установка механизма представления handlebars
var handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
	helpers: {
	 	section:function(name, options){
	 		//console.log(this);
	        if(!this._sections){this._sections = {};}
	        this._sections[name] = options.fn(this);
	        return null;
	    }
	}
});
// middleware to handle logo image easter eggs

app.use(require('cors')());

app.use('/api', require('cors')());


var twitter = require('./lib/twitter')({
	consumerKey: credentials.twitter.consumerKey,
	consumerSecret: credentials.twitter.consumerSecret,
});

/*
require('./routes.js')(app);
routes.forEach(function(route){
	app[route.method](route.handler);
});*/





var static = require('./lib/static.js').map;
app.use(function(req, res, next){
	var now = new Date();

	res.locals.logoImage =  now.getMonth()===1 && now.getDate()===13 ?
		static('/img/logo_bud_clark.png') :
		static('/img/logo.png');
	next();
});

// create "admin" subdomain...this should appear
// before all your other routes
var admin = express.Router();
app.use(require('vhost')('admin.*', admin));

// создаем маршруты для "admin"; это можно разместить в любом месте.
/*admin.get('/', function(req, res){
	res.render('admin/home');
});
*/
/*
app.get('/', function(req, res){
// следующее по существу эквивалентно: if(req.secure)
	if(req.headers['x-forwarded-proto']==='https') {
		res.send('line is secure');
	} else {
		res.send('you are insecure!');
	}
});
*/

admin.get('/users', function(req, res){
	res.render('admin/users');
});


app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('cors')());


app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret,
}));

// это должно быть вставлено после анализатора тела запроса,
// анализатора cookie и express-сессии
app.use(require('csurf')());
app.use(function(req, res, next){
	res.locals._csrfToken = req.csrfToken();
	next();
});

app.get('/foo',
	function(req,res, next){
		if(Math.random() < 0.33) return next();
			res.send('красный');
	},

	function(req,res, next){
		if(Math.random() < 0.5) return next();
			res.send('зеленый');
	},

	function(req,res){
		res.send('синий');
	},
)


function specials(req, res, next){
	res.locals.specials = '1'//getSpecialsFromDatabase();
	next();
}





app.get('/page-with-specials', specials, function(req,res){
	res.render('page-with-specials');
});


app.use(function(req, res, next){
// Если имеется экстренное сообщение,
// переместим его в контекст, а затем удалим
res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

// Установка механизма представления handlebars
var handlebars = require('express-handlebars').create({
	defaultLayout:'main',
	helpers: {
		section: function(name, options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		},
		static: function(name) {
			return require('./lib/static.js').map(name);
		}
	}
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


var test;


//var connect = require('connect');
// var MongoSessionStore = require("session-mongoose")(connect);
var session    = require('express-session');
var MongoSessionStore = require('connect-mongo')(session);

var sessionStore = new MongoSessionStore({
	url: credentials.mongo[app.get('env')].connectionString
});

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret,
	store: sessionStore,
}));

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

var opts = {
	server: {
		socketOptions: { keepAlive: 1}
	},
	 useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    reconnectTries: 30,
    reconnectInterval: 500,
};

switch(app.get('env')){
	case 'development':
		mongoose.connect(credentials.mongo.development.connectionString, opts);
	break;
	case 'production':
		mongoose.connect(credentials.mongo.production.connectionString, opts);
	break;
	default:
	throw new Error('Неизвестная среда выполнения: ' + app.get('env'));
}

var Vacation = require('./models/vacation.js');

Vacation.find(function(err, vacations){
	if(err) return cosole.error(err);
		if(vacations.length) return;
		new Vacation({
			name: 'Однодневный тур по реке Худ',
			slug: 'hood-river-day-trip',
			category: 'Однодневный тур',
			sku: 'HR199',
			description: 'Проведите день в плавании по реке Колумбия ' +
				'и насладитесь сваренным по традиционным рецептам ' +
				'пивом на реке Худ!',
			priceInCents: 9995,
			tags: ['однодневный тур', 'река худ', 'плавание', 'виндсерфинг', 'пивоварни'],
			inSeason: true,
			maximumGuests: 16,
			available: true,
			packagesSold: 0,
		}).save();

		new Vacation({
			name: 'Отдых в Орегон Коуст',
			slug: 'oregon-coast-getaway',
			category: 'Отдых на выходных',
			sku: 'OC39',
			description: 'Насладитесь океанским воздухом ' +
				'и причудливыми прибрежными городками!',
			priceInCents: 269995,
			tags: ['отдых на выходных', 'орегон коуст',
				'прогулки по пляжу'],
			inSeason: false,
			maximumGuests: 8,
			available: true,
			packagesSold: 0,
		}).save();

		new Vacation({
			name: 'Скалолазание в Бенде',
			slug: 'rock-climbing-in-bend',
			category: 'Приключение',
			sku: 'B99',
			description: 'Пощекочите себе нервы горным восхождением ' +
				'на пустынной возвышенности.',
			priceInCents: 289995,
			tags: ['отдых на выходных', 'бенд', 'пустынная возвышенность', 'скалолазание'],
			inSeason: true,
			requiresWaiver: true,
			maximumGuests: 4,
			available: false,
			packagesSold: 0,
			notes: 'Гид по данному туру в настоящий момент ' +
				'восстанавливается после лыжной травмы.',
		}).save();
});

app.set('port', process.env.PORT || 3000);
	// пользовательская страница 404
/*
app.get('/', function(req, res) {
	res.render('home');
});
*/


// См. маршрут для /cart/add в прилагаемом к книге репозитории
/*app.get('/vacations', function(req, res){
	Vacation.find({ available: true }, function(err, vacations){
		var context = {
			vacations: vacations.map(function(vacation){
				return {
					sku: vacation.sku,
					name: vacation.name,
					description: vacation.description,
					price: vacation.getDisplayPrice(),
					inSeason: vacation.inSeason,
				}
			})
		};
		res.render('vacations', context);
	});
});

*/

var VacationInSeasonListener = require ('./models/vacationInSeasonListener.js');

app.get('/notify-me-when-in-season', function(req, res){
	res.render('notify-me-when-in-season', { sku: req.query.sku });
});

app.post('/notify-me-when-in-season', function(req, res){
	VacationInSeasonListener.update(
		{ email: req.body.email },
		{ $push: { skus: req.body.sku } },
		{ upsert: true },
		function(err){
			if(err) {
				console.error(err.stack);
				req.session.flash = {
					type: 'danger',
					intro: 'Упс!',
					message: 'При обработке вашего запроса ' +
						'произошла ошибка.',
				};
				return res.redirect(303, '/vacations');
			}
			req.session.flash = {
				type: 'success',
				intro: 'Спасибо!',
				message: 'Вы будете оповещены, когда наступит ' +
					'сезон для этого тура.',
			};
			return res.redirect(303, '/vacations');
		}
	);
});

app.get('/set-currency/:currency', function(req,res){
	req.session.currency = req.params.currency;
	return res.redirect(303, '/vacations');
});

function convertFromUSD(value, currency){
	switch(currency){
		case 'USD': return value * 1;
		case 'GBP': return value * 0.6;
		case 'BTC': return value * 0.0023707918444761;
		default: return NaN;
	}
}


function authorize(req, res, next){
	if(req.session.authorized) return next();
	res.render('not-authorized');
}

app.get('/secret', authorize, function(){
	res.render('secret');
})

app.get('/sub-rosa', authorize, function(){
	res.render('sub-rosa');
});

app.get('/user(name)?', function(req,res){
	res.render('user');
});

app.get('/khaa+n', function(req,res){
	res.render('khaaan');
});

app.get(/crazy|mad(ness)?|lunacy/, function(req,res){
	res.render('madness');
});

var staff = {
	mitch: {
		bio: 'Митч - человек, который прикроет вашу спину ' +
			'во время драки в баре.' },
	madeline: { bio: 'Мадлен — наш специалист по Орегону.' },
	walt: { bio: 'Уолт — наш специалист по пансионату Орегон Коуст.' },
};

app.get('/staff/:name', function(req, res){
	var info = staff[req.params.name];

	if(!info) return next(); // в конечном счете передаст
	// управление обработчику кода 404
	res.render('staffer', info);
});
/*
var staff = {
	portland: {
		mitch: { bio: 'Митч - человек, который прикроет вашу спину ' +
			'во время драки в баре.' },
		madeline: { bio: 'Мадлен — наш специалист по Орегону.' },
	},
	bend: {
		walt: { bio: 'Уолт — наш специалист по пансионату Орегон Коуст.' },
	},
};

app.get('/staff/:city/:name', function(req, res){
	var info = staff[req.params.city][req.params.name];
	if(!info) return next(); // в конечном счете передаст
		// управление обработчику кода 404
	res.render('staffer', info);
});
*/

app.get('/vacations', function(req, res){
	Vacation.find({ available: true }, function(err, vacations){
		var currency = req.session.currency || 'USD';
		var context = {
			currency: currency,
			vacations: vacations.map(function(vacation){
				return {
					sku: vacation.sku,
					name: vacation.name,
					description: vacation.description,
					inSeason: vacation.inSeason,
					price: convertFromUSD(vacation.priceInCents/100, currency),
					qty: vacation.qty,
				}
			})
		};
		switch(currency){
			case 'USD': context.currencyUSD = 'selected'; break;
			case 'GBP': context.currencyGBP = 'selected'; break;
			case 'BTC': context.currencyBTC = 'selected'; break;
		}
		res.render('vacations', context);
	});
});


var topTweets = {
	count: 0,
	lastRefreshed: 0,
	refreshInterval: 15 * 60 * 1000,
	tweets: [],
};

function getTopTweets(cb){
	if(Date.now() < topTweets.lastRefreshed + topTweets.refreshInterval)
		return cb(topTweets.tweets);
	twitter.search('#news', topTweets.count, function(result){
		var formattedTweets = [];
		var promises = [];
		var embedOpts = { omit_script: 1 };

		result.statuses.forEach(function(status){
			var deferred = Q.defer();
			twitter.embed(status.id_str, embedOpts, function(embed){
				formattedTweets.push(embed.html);
				deferred.resolve();
			});
			promises.push(deferred.promise);
		});
		Q.all(promises).then(function(){
			topTweets.lastRefreshed = Date.now();
			cb(topTweets.tweets = formattedTweets);
		});
	});
}

// mmiddleware to add top tweets to context
app.use(function(req, res, next) {
	getTopTweets(function(tweets) {
		res.locals.topTweets = tweets;

		//console.log(res.locals.topTweets);
		next();
	});
});


// initialize dealers
Dealer.find({}, function(err, dealers){
	if(dealers.length) return;

	new Dealer({
		name: 'Oregon Novelties',
		address1: '912 NW Davis St',
		city: 'Portland',
		state: 'OR',
		zip: '97209',
		country: 'US',
		phone: '503-555-1212',
		active: true,
	}).save();

	new Dealer({
		name: 'Bruce\'s Bric-a-Brac',
		address1: '159 Beeswax Ln',
		city: 'Manzanita',
		state: 'OR',
		zip: '97209',
		country: 'US',
		phone: '503-555-1212',
		active: true,
	}).save();

	new Dealer({
		name: 'Aunt Beru\'s Oregon Souveniers',
		address1: '544 NE Emerson Ave',
		city: 'Bend',
		state: 'OR',
		zip: '97701',
		country: 'US',
		phone: '503-555-1212',
		active: true,
	}).save();

	new Dealer({
		name: 'Oregon Goodies',
		address1: '1353 NW Beca Ave',
		city: 'Corvallis',
		state: 'OR',
		zip: '97330',
		country: 'US',
		phone: '503-555-1212',
		active: true,
	}).save();

	new Dealer({
		name: 'Oregon Grab-n-Fly',
		address1: '7000 NE Airport Way',
		city: 'Portland',
		state: 'OR',
		zip: '97219',
		country: 'US',
		phone: '503-555-1212',
		active: true,
	}).save();
});

// dealer geocoding
function geocodeDealer(dealer){
	var addr = dealer.getAddress(' ');
	if(addr===dealer.geocodedAddress) return;   // already geocoded

	if(dealerCache.geocodeCount >= dealerCache.geocodeLimit){
		// has 24 hours passed since we last started geocoding?
		if(Date.now() > dealerCache.geocodeCount + 24 * 60 * 60 * 1000){
			dealerCache.geocodeBegin = Date.now();
			dealerCache.geocodeCount = 0;
		} else {
			// we can't geocode this now: we've
			// reached our usage limit
			return;
		}
	}

	var geocode = require('./lib/geocode.js');
	geocode(addr, function(err, coords){
		if(err) return console.log('Geocoding failure for ' + addr);
		dealer.lat = coords.lat;
		dealer.lng = coords.lng;
		dealer.save();
	});
}


var dealerCache = {
	lastRefreshed: 0,
	refreshInterval: 60 * 60 * 1000,
	jsonUrl: '/dealers.json',
	geocodeLimit: 2000,
	geocodeCount: 0,
	geocodeBegin: 0,
};
dealerCache.jsonFile = __dirname +
	'/public' + dealerCache.jsonUrl;

dealerCache.refresh = function(cb){
	if(Date.now() > dealerCache.lastRefreshed + dealerCache.refreshInterval){
// нам нужно обновить кэш
		Dealer.find({ active: true }, function(err, dealers){
			if(err) return console.log('Error fetching dealers: '+
				err);
// geocodeDealer ничего не будет делать если
// координаты не устаревшие
			dealers.forEach(geocodeDealer);
// сейчас мы запишем всех дилеров в файл JSON
			fs.writeFileSync(dealerCache.jsonFile,
				JSON.stringify(dealers));
// все сделано — вызываем функцию
// обратного вызова
			cb();
		});
	}
};

function refreshDealerCacheForever(){
	dealerCache.refresh(function(){
		// call self after refresh interval
		setTimeout(refreshDealerCacheForever,
			dealerCache.refreshInterval);
	});
}

// создать пустой кэш, если он не существует, во избежание ошибки 404
if(!fs.existsSync(dealerCache.jsonFile)) fs.writeFileSync(JSON.stringify([]));
// начать обновление кэша
refreshDealerCacheForever();

var routes = require('./routes.js')(app);

app.get('/about', function(req, res) {
	res.render('about');
});

var autoViews = {};
var fs = require('fs');
	app.use(function(req,res,next){
		var path = req.path.toLowerCase();
		// проверка кэша; если он там есть, визуализируем представление
		if(autoViews[path]) return res.render(autoViews[path]);
		// если его нет в кэше, проверяем наличие
		// подходящего файла .handlebars
		if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
			autoViews[path] = path.replace(/^\//, '');
			return res.render(autoViews[path]);
		}
		// представление не найдено; переходим к обработчику кода 404
	next();
});


var Attraction = require('./models/attraction.js');
/*app.get('/api/attractions', function(req, res){
	Attraction.find({ approved: true }, function(err, attractions){
		if(err) return res.status(500).send('Произошла ошибка: ошибка базы данных.');
			res.json(attractions.map(function(a){
				return {
					name: a.name,
					id: a._id,
					description: a.description,
					location: a.location,
				}
			}));
	});
});


app.post('/api/attraction', function(req, res){
	var a = new Attraction({
		name: req.body.name,
		description: req.body.description,
		location: { lat: req.body.lat, lng: req.body.lng },
		history: {
			event: 'created',
			email: req.body.email,
			date: new Date(),
		},
		approved: false,
	});

	a.save(function(err, a){
		if(err) return res.status(500).send(' Произошла ошибка: ошибка базы данных.');
			res.json({ id: a._id });
	});
});

app.get('/api/attraction/:id', function(req,res){
	Attraction.findById(req.params.id, function(err, a){
		if(err) return res.status(500).send(' Произошла ошибка: ошибка базы данных.');
			res.json({
				name: a.name,
				id: a._id,
				description: a.description,
				location: a.location,
			});
	});
});
*/


// Здесь находятся маршруты сайта
// Описывайте маршруты API здесь с помощью rest.VERB...
// Конфигурация API
var options = {
	context: '/api',
	//logger:{ file: 'mochaTest.log', level: 'debug' },
	//apiKeys: [ '849b7648-14b8-4154-9ef2-8d1dc4c2b7e9' ],
	// discover: { path: 'discover', secure: true },
	// proto: { path: 'proto', secure: true }
}

var apiOptions = {
	context: '/api',
	domain: require('domain').create(),
};

//var rest = Rest.create( apiOptions );

//var rest = Rest.create( apiOptions );
/*
var rest = Rest.create( options )
app.use( rest.processRequest() )
app.use( function(req, res, next){
	if(req.session)
		req.session.destroy()
	// render error page by some renderer...
	renderer.render( 'error', {}, function(err, html){
		res.writeHead( 500, { 'Content-Type' : 'text/html' } )
		res.end( html );
	} )
} )
*/
// Компоновка API в конвейер
//app.use(rest.rester(apiOptions));
// Здесь находится обработчик кода 404

async function service( request, content, cb ){
	console.log(cb);
	console.log( 'Received headers:' + JSON.stringify( request.headers ) )
	console.log( 'Received parameters:' + JSON.stringify( request.parameters ) )
	console.log( 'Received JSON object:' + JSON.stringify( content ) )
	console.log( 'cb:' + JSON.stringify(cb) )
	return 'ok'
}
/*rest.get( [ { path: '/shake', version: '>=2.0.0' }, { path: '/twist', version: '>=2.1.1' } ], service )


rest.get('/attractions', function(req, content, cb){
	Attraction.find({}, function(err, attractions){
		if(err) return cb({ error: 'Внутренняя ошибка.' });
			cb(null, attractions.map(function(a){
				return {
					name: a.name,
					description: a.description,
					location: a.location,
				};
			}));
	});
	//return { result: 'Done.', options: {statusCode:201} }
})


rest.post('/attraction', function(req, content, cb){
console.log(req.body.name);
	/*var a = new Attraction({
		name: req.body.name,
		description: req.body.description,
		location: { lat: req.body.lat, lng: req.body.lng },
		history: {
			event: 'created',
			email: req.body.email,
			date: new Date(),
		},
		approved: false,
	});

console.log(a);
	a.save(function(err, a){
		if(err) return cb({ error: 'Невозможно добавить ' +
			'достопримечательность.' });
		cb(null, { id: a._id });
	});
});

rest.get('/attraction/:id', function(req, content, cb){
	Attraction.findById(req.params.id, function(err, a){
		if(err) return cb({ error: 'Невозможно извлечь ' +
			'достопримечательность.' });
		cb(null, {
			name: attraction.name,
			description: attraction.description,
			location: attraction.location,
		});
	});
});
*/
apiOptions.domain.on('error', function(err){
	console.log('API domain error.\n', err.stack);
		setTimeout(function(){
			console.log('Останов сервера после ошибки домена API.');
			process.exit(1);
		}, 5000);
	server.close();
	var worker = require('cluster').worker;
	if(worker) worker.disconnect();
});

// middleware to handle logo image easter eggs
/*var static = require('./lib/static.js').map;
app.use(function(req, res, next){
	var now = new Date();
	res.locals.logoImage = now.getMonth()===1 && now.getDate() === 13 ?
		static('/img/logo_bud_clark.png') :
		static('/img/logo.png');
	next();
});*/

var auth = require('./lib/auth.js')(app, {
// baseUrl опционален; по умолчанию будет
// использоваться localhost, если вы пропустите его;
// имеет смысл установить его, если вы не
// работаете на своей локальной машине. Например,
// если вы используете staging-сервер,
// можете установить в переменной окружения BASE_URL
// https://staging.meadowlark.com
	baseUrl: process.env.BASE_URL,
	providers: credentials.authProviders,
	successRedirect: '/account',
	failureRedirect: '/unauthorized',
});
// auth.init() соединяется в промежуточном ПО Passport:
auth.init();
// теперь мы можем указать наши маршруты auth:
auth.registerRoutes();

// authorization helpers
function customerOnly(req, res, next){
	if(req.user && req.user.role==='customer') return next();
	// we want customer-only pages to know they need to logon
	res.redirect(303, '/unauthorized');
}

function employeeOnly(req, res, next){
	if(req.user && req.user.role==='employee') return next();
	// we want employee-only authorization failures to be "hidden", to
	// prevent potential hackers from even knowhing that such a page exists
	next('route');
}

function allow(roles) {
	return function(req, res, next) {
		if(req.user && roles.split(',').indexOf(req.user.role)!==-1) return next();
		res.redirect(303, '/unauthorized');
	};
}
app.get('/account', allow('customer,employee'), function(req, res){
	res.render('account');
});

// маршруты покупателя
app.get('/account', customerOnly, function(req, res){
	res.render('account');
});
app.get('/account/order-history', customerOnly, function(req, res){
	res.render('account/order-history');
});
app.get('/account/email-prefs', customerOnly, function(req, res){
	res.render('account/email-prefs');
});
// маршруты сотрудника
app.get('/sales', employeeOnly, function(req, res){
	res.render('sales');
});

app.get('/account', function(req, res) {
	if(!req.user)
		return res.redirect(303, '/unauthorized');
	res.render('account', { username: req.user.name });
});

// нам также нужна страница 'Не авторизирован'
app.get('/unauthorized', function(req, res) {
	res.status(403).render('unauthorized');
});

// Обобщенный обработчик 404 (промежуточное ПО)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// Обработчик ошибки 500 (промежуточное ПО)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

exports.home = function(req, res){
	res.render('home');
};
exports.about = function(req, res){
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
};


function startServer() {
	app.listen(app.get('port'), function() {
		console.log( 'Express запущен в режиме ' + app.get('env') +
			' на http://localhost:' + app.get('port') +
			'; нажмите Ctrl+C для завершения.' );
		});
}

if(require.main === module){
	// Приложение запускается непосредственно;
	// запускаем сервер приложения
	startServer();
} else {
	// Приложение импортируется как модуль
	// посредством "require":
	// экспортируем функцию для создания сервера
	module.exports = startServer;
}


/*
var options = {
	key: fs.readFileSync(__dirname + '/ssl/meadowlark.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt'),
};
https.createServer(options, app).listen(app.get('port'), function(){
	console.log('Express started in ' + app.get('env') +
		' mode on port ' + app.get('port') + ' using HTTPS.');
});*/