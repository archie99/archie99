var mongoose = require('mongoose');
//db = mongoose.createConnection('mongodb://localhost:27017/test');
///this works as well:
mongoose.connect('mongodb://localhost:27017/visits');
var db = mongoose.connection;
exports.db = db;

var Schema = mongoose.Schema;
///COLLECTIONS:

///Clients:
var ClientSchema = new Schema({
    lastname: String,
    firstname: String,
    email: String,
    cell: String,
    home: String,
    work: String,
    address: String,
    birthday: String,
    family: String,
    contacts: String,
    comments: String,
    city: String,
    active: Number
    });
exports.Clients = db.model('clients', ClientSchema);

///Event:
var EventSchema = new Schema({
    start_date: Date,
    end_date: Date,
    text: String,
    clientid: String,
    comments: String,
    check: Number
    });
exports.Events = db.model('events', EventSchema);

//Services:
var ServiceSchema = new Schema({
    eventid: String,
    service: String,
    price: Number,
    comments: String
    });
exports.Services = db.model('services', ServiceSchema);