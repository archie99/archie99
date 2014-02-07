var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var dbmodule = require('./public/modules/db');



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//CLIENTS:
app.get('/', routes.index);
//All clients for Clients page:
app.get('/clients', routes.clients());
//Single client for Client Edit page:
app.get('/_client/:clientid', routes.client());
//Get Single client for EditEvent page:
app.get('/_clientjson/:clientid', routes.clientjson());
//Get events for a client for ClientEvents page:
app.get('/_client/:clientid/events', routes.clientevents());
//Get json clients for client search by pattern on Clients page:
app.get('/clients/:pattern', routes.clientssearch());
//Get all clients for EditEvent page clients dropdown:
app.get('/clientsjson', routes.clientsjson());
//??Get some clients by pattern for EditEvent page clients dropdown:
//app.get('/clientsjson/:pattern', routes.clientssearchjson());
//Update client:
app.post('/updateclient/:clientid', routes.updateclient);
//Create new client:
app.get('/newclient', routes.newclient);
//Save new client:
app.post('/addclient', routes.addclient);

//EVENTS:
//app.get('/source/:source/event/:eventid', routes.editevent());
app.get('/event/:eventid', routes.editevent());
//app.get('/event/:eventid/services',routes.eventservices());
app.get('/event/:eventid/servicesj', routes.eventservicesj());
app.post('/event/:eventid/update', routes.updateevent());

//SERVICE:
app.get('/service/:serviceid', routes.servicej());
app.get('/event/:eventid/addservice', routes.addservice());
app.post('/service/:serviceid/update', routes.updateservice());
app.get('/event/:eventid/service/:serviceid/delete', routes.deleteservice());
app.get('/event/:eventid/services/delete', routes.deleteservices());
//"event/" + eventid + "/service/" + serviceid + "/delete"

//CALENDAR:
app.get('/data', routes.getdata());
app.post('/data', routes.postdata());
//app.get('/a', routes.ajax);
//app.get('/yui', routes.yui);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
