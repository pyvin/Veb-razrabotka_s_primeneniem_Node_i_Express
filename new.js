var http = require('http');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);

var connect = require('connect'),
    bodyParser = require('body-parser')

var Rest = require('connect-rest')

// sets up connect and adds other middlewares to parse query, parameters, content and session
// use the ones you need
var connectApp = connect()
    .use( bodyParser.urlencoded( { extended: true } ) )
    .use( bodyParser.json() )

// initial configuration of connect-rest. all-of-them are optional.
// default context is /api, all services are off by default
var options = {
    context: '/api',
    logger:{ file: 'mochaTest.log', level: 'debug' },
    apiKeys: [ '849b7648-14b8-4154-9ef2-8d1dc4c2b7e9' ],
    // discover: { path: 'discover', secure: true },
    // proto: { path: 'proto', secure: true }
}
var rest = Rest.create( options )

// adds connect-rest middleware to connect
connectApp.use( rest.processRequest() )

// defines a few sample rest services
rest.get('/books/:title/:chapter', function (req, res, cb) {
console.log(req);
} )

rest.post( { path: '/make', version: '>=1.0.0' },  function (req, res, cb) {

} )

rest.post( [ '/act', '/do' ], function (req, res, cb) {

} )

rest.post( [ { path: '/shake', version: '>=2.0.0' }, { path: '/twist', version: '>=2.1.1' } ], function (req, res, cb) {

} )



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