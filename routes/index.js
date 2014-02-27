var mongoose = require('mongoose');
//var x = require('mongoose').Types.ObjectId;
//var OID = mongoose.Types.ObjectId;
var dbmodule = require('../public/modules/db');
var db = require('mongoskin').db("localhost/visits", {w: 0});
db.bind('events');
db.bind('clients');
db.bind('records');
db.bind('services');

exports.expences = function(req, res){
    return function(req, res){
        var colExpences = dbmodule.Expences;
        var exp = new Object();
        exp.years = [];
        var expyears = [];       
        colExpences.aggregate([{$sort:{'date':1}},{$group:{_id:{year:{$year: '$date'}}}}], function(err, years){
            if(err){console.log(err);}
            else{
                if(years.length > 0){                  
                  for(var i = 0; i < years.length; i++){                    
                    expyears.push(years[i]._id.year);                    
                  }      
                }
            }
            GetMonths(expyears, function(data){                                 
                res.render('expences', {'data': data});    
            });            
        });        
    }
}

function GetMonths(expyears, next){    
    var count = expyears.length;
    var resultyears = [];
    console.log(expyears.length);
    expyears.forEach(function(year){
       var resultyear = new Object();
       var colExpences = dbmodule.Expences;              
       var s = new Date(year + ",1,1");
       var e = new Date(year + ",1,1");
       e.setFullYear(e.getFullYear() + 1);       
       console.log(year + " s: " + s.toISOString() + " e: " + e.toISOString());
       colExpences.aggregate(
            [
                {$sort:{'date':1}},
                {$match: {date :{$gte : s, $lte : e }}},
                {$group: {_id: {month: {$month: '$date'}}}}   
            ],
            function(err, resultmonths){
                if(err){console.log(err);}
                else{
                    var months = [];
                    for(i = 0; i < resultmonths.length; i++){                        
                        months[i] = resultmonths[i]._id.month;                                
                    }                    
                    GetExpences(year, months, function(resultmonths){                     
                       resultyear.months = resultmonths;
                       resultyear.name = year;
                       resultyears.push(resultyear);
                       count--;
                       if(count <= 0){                            
                            next(resultyears);    
                        }                           
                    });              
                }
       });       
    });
}

function GetExpences(expyear, expmonths, next){   
    var count = expmonths.length;    
    var months = [];
    var colExpences = dbmodule.Expences;
    expmonths.forEach(function(expmonth){
        var month = new Object();
        month.name = expmonth;
        var exp = [];
        var s = new Date(expyear + "," + expmonth + ",1");
        var e = new Date(expyear + "," + expmonth + ",1");
        e.setMonth(e.getMonth() + 1);
        console.log(expyear + " month: " + expmonth + " s: " + s.toISOString() + " e: " + e.toISOString());
        colExpences.find({'date':{$gte:s, $lt:e}},null, {sort:{'date':-1}}, function(err, results){
                if(err){console.log(err);}
                else{
                        if(results.length > 0){                        
                            for(i = 0; i < results.length; i++){
                                exp.push(results[i]);    
                            }
                            month.exp = exp;
                            months.push(month);
                        }                        
                        count--;
                        if(count <= 0){                            
                            next(months);
                        }    
                }                    
        });        
    });    
}

exports.reportmonth = function(req, res){
    return function(req, res){
        var year, month, bank, s, e;        
        var Incomes = [];
        var Expences = [];
        if(req.params.year){
            year = req.params.year;
        }
        else{
            var today = new Date();
            year = today.getFullYear();    
        }
        if(req.params.month){
            if(req.params.month != 13){
                month = req.params.month;
                s = new Date(year + "," + month + ",1")
                e = new Date(year + "," + month + ",1")        
                e.setMonth(e.getMonth() + 1);                
            }
            else{ 
                month = 13;               
                s = new Date(year + ",1,1");
                e = new Date(year + ",1,1");       
                e.setFullYear(e.getFullYear() + 1);                  
                }
        }
        else{
            var today = new Date();
            month = today.getMonth() + 1;// getMonth returns 0-11
            s = new Date(year + "," + month + ",1")
            e = new Date(year + "," + month + ",1")        
            e.setMonth(e.getMonth() + 1); 
        }
        if(req.params.bank){bank = req.params.bank;}
        else{bank = 0;}        
        var colEvents = dbmodule.Events;
        var colServices = dbmodule.Services;
        var colExpences = dbmodule.Expences;
        if(bank == 0){
          var quer = {start_date : {$gte : s}, end_date: {$lte : e }};
        }
        else{
          var quer = {start_date : {$gte : s}, end_date: {$lte : e }, check: 1};  
        }        
        //colEvents.find({start_date : {$gte : s}, end_date: {$lte : e }, check: bank}, {_id : 1},
        colEvents.find(quer, {_id : 1},
            function(err, events){
                if(err){console.log(err);}
                else{
                        var income = [];
                        var totalservices = 0;
                        var count = events.length;
                        var eventids = [];                        
                        for(i = 0; i < events.length; i++){
                            eventids.push(events[i].id);
                        }                        
                        colServices.aggregate([
                                                {$match: {eventid: {$in: eventids}}},                
                                                {$group: {_id: "$service", total: {$sum: "$price"}}},
                                                {$sort: {'total': -1}}        
                                              ], 
                                              function(err, incomes){
                                                if(err){console.log(err);}
                                                else{
                                                    console.log("from aggregate" + bank);
                                                    if(bank == 0){   
                                                        var query = [
                                                            {$match: {date : {$gte : s, $lte : e }}},
                                                            {$group: {_id: "$type", total: {$sum: "$price"}}},
                                                            {$sort: {'total': -1}}       
                                                            ];
                                                    }
                                                    else{
                                                        var query = [
                                                            {$match: {date : {$gte : s, $lte : e }, payment:{$ne: "CASH"}}},
                                                            {$group: {_id: "$type", total: {$sum: "$price"}}},
                                                            {$sort: {'total': -1}}       
                                                        ];
                                                    }                                                    
                                                    colExpences.aggregate(query,
                                                        //[
                                                        //    {$match: {date : {$gte : s, $lte : e }}},
                                                        //    {$group: {_id: "$type", total: {$sum: "$price"}}},
                                                        //    {$sort: {'total': -1}}       
                                                        //    ], 
                                                            function(err, exp){
                                                               if(err){console.log(err);}
                                                               else{                     
                                                                   res.render('monthreport', {'incomes': incomes, 'expences':exp, 'year': year, 'month':month, 'bank': bank});           
                                                               } 
                                                    });
                                                    
                                                }                                                
                        });
                }                    
        });       
    }    
}



exports.clients = function(){    
    return function(req, res){
        var colClients = dbmodule.Clients;
        colClients.find({}, null, {'sort': {'firstname': 1}}, function(err, docs){
            res.render('clients', {'clients': docs});            
            });
    };        
};

exports.clientssearch = function(){    
    return function(req, res){
        var colClients = dbmodule.Clients;
        var pattern = req.params.pattern;        
        
        colClients.find({'firstname': new RegExp("^" + pattern, "i") }, null, {'sort': {'firstname': 1}}, function(err, docs){
            res.render('clients', {'clients': docs});            
            });        
    };        
};

exports.clientssearchjson = function(){    
    return function(req, res){
        var colClients = dbmodule.Clients;
        var pattern = req.params.pattern;        
        
        colClients.find({'firstname': new RegExp("^" + pattern, "i") }, 'firstname lastname', {'sort': {'firstname': 1}}, function(err, docs){
            res.send(docs);            
            });        
    };        
};

exports.clientsjson = function(){    
    return function(req, res){
        var colClients = dbmodule.Clients;          
        colClients.find({}, 'firstname lastname', {'sort': {'firstname': 1}}, function(err, docs){
            res.send(docs);            
            });        
    };        
};

exports.newclient = function(req, res){
    res.render('newclient', {title: 'Add New Client'});    
    };

exports.addclient = function(req, res){
    var colClients = dbmodule.Clients;
    var newclient = new colClients;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var active = 0;
        if (req.body.active == 1){
            active = 1;
            }
    newclient.firstname = firstname[0].toUpperCase() + firstname.slice(1);
    newclient.lastname =  lastname[0].toUpperCase() + lastname.slice(1);
    newclient.email = req.body.email;
    newclient.cell = req.body.cell;
    newclient.home = req.body.home;
    newclient.work = req.body.work;
    newclient.address = req.body.address;
    newclient.city = req.body.city;
    newclient.birthday = req.body.birthday;
    newclient.family = req.body.family;
    newclient.contacts = req.body.contacts;
    newclient.comments = req.body.comments;
    newclient.active = active;

    newclient.save(function(err){
        if (err){
            res.send("There was a problem adding the information to the database.");
            console.log( err);
        }
        else {
            res.location("clients");
            res.redirect("clients");
        }
    });
};

exports.updateservice = function() {
    return function(req, res){
    var colServices = dbmodule.Services;
    //var newService = new colServices;
    var eventid = req.body.eventid;
    //newService.service = req.body.service;
    //newService.price = req.body.price;
    //newService.comments = req.body.comments;
    //newService.eventid = req.body.eventid;
    //newService._id = req.body.id;
    colServices.findByIdAndUpdate(req.body.id, req.body, function(err){
        if (err){
            res.send("There was a problem adding the information to the database.");
            console.log( err);
        }
        else {
            res.location("event/" + eventid);
            res.redirect("event/" + eventid);
        }
    });
    }
};

exports.updateexpence = function() {
    return function(req, res){
    var colExpence = dbmodule.Expences;
    var expenceid  = req.params.expenceid;    
    colExpence.findByIdAndUpdate(expenceid, req.body, function(err){
        if (err){
            res.send("There was a problem adding the information to the database.");
            console.log( err);
        }
        else {
            res.send("Saved");            
        }
    });
    }
};

exports.updateevent = function() {
    return function(req, res){
    var colEvents = dbmodule.Events;
    var eventid = req.body.eventid;
    colEvents.findByIdAndUpdate(req.body.eventid, req.body, function(err){
        if (err){
            res.send("There was a problem adding the information to the database.");
            console.log( err);
        }
        else {
            //res.location("/source/edit/event/" + eventid);
            //res.redirect("/source/edit/event/" + eventid);
            res.location("/event/" + eventid);
            res.redirect("/event/" + eventid);
        }
    });
    }
};

exports.addservice = function() {
    return function(req, res){
    var colServices = dbmodule.Services;
    var newService = new colServices;
    var eventid = req.params.eventid;

    newService.eventid = eventid;
    newService.service = "";
    newService.price = 0;
    newService.comments = "";
    newService.save(function(err, result){
        if (err){
            res.send("There was a problem adding the information to the database.");
            console.log( err);
        }
        else {
            //res.location("event/" + eventid);
            //res.redirect("event/" + eventid);
            res.send(result);
        }
    });
    }
};

exports.addexpence = function() {
    return function(req, res){
    var colExpences = dbmodule.Expences;
    var newExpence = new colExpences;    
    newExpence.date = new Date();
    newExpence.type = "";
    newExpence.price = 0;
    newExpence.payment = "";
    newExpence.comments = "";
    newExpence.save(function(err, result){
        if (err){
            console.log( err);
            res.send("There was a problem adding the information to the database.");            
        }
        else {            
            res.send(result);
        }
    });
    }
};

exports.deleteservice = function() {
    return function(req, res){
    var colServices = dbmodule.Services;
    var eventid = req.params.eventid;
    var serviceid = req.params.serviceid; 
    colServices.remove({'_id':serviceid}, function(err, result){
        if (err){
            res.send("There was a problem removing the information from the database.");
            console.log( err);
        }
        else {
            //res.location("event/" + eventid);
            res.redirect("event/" + eventid);
            //res.send(result);
        }
    });
    }
};


exports.deleteexpence = function() {
    return function(req, res){
    var colExpences = dbmodule.Expences;
    var expenceid = req.params.expenceid;
    //var serviceid = req.params.serviceid; 
    colExpences.remove({'_id':expenceid}, function(err, result){
        if (err){
            res.send("There was a problem removing the information from the database.");
            console.log( err);
        }
        else {
            //res.location("event/" + eventid);
            //res.redirect("event/" + eventid);
            res.send("Expence deleted.");
        }
    });
    }
};


exports.deleteservices = function() {
    return function(req, res){
    var colServices = dbmodule.Services;
    var eventid = req.params.eventid;    
    colServices.remove({'eventid':eventid}, function(err, result){
        if (err){            
            console.log( err);            
        }
        else {                        
            console.log(result + " services deleted.");            
        }
    });
    }
};

exports.updateclient = function(req, res){
    var colClients = dbmodule.Clients;
    colClients.findById(req.params.clientid, function(err, doc){
        var firstname = req.body.firstname;
        firstname = firstname[0].toUpperCase() + firstname.slice(1);
        var lastname = req.body.lastname;
        lastname = lastname[0].toUpperCase() + lastname.slice(1);
        var active = 0;
        if (req.body.active == 1){
            active = 1;
            }
        if (err){
            res.send("Not found in the database.");
            console.log(err);
            }
        else {
            doc.firstname = firstname;
            doc.lastname =  lastname;
            doc.email = req.body.email;
            doc.cell = req.body.cell;
            doc.home = req.body.home;
            doc.work = req.body.work;
            doc.address = req.body.address;
            doc.city = req.body.city;
            doc.birthday = req.body.birthday;
            doc.family = req.body.family;
            doc.contacts = req.body.contacts;
            doc.comments = req.body.comments;
            doc.active = active;
            doc.save(function(e){
                if (e) {
                    res.send("There was a problem updating the information to the database.");
                    console.log(e);
                    }
                else {
                    res.location("clients");
                    res.redirect("clients");                    
                    }
                });
            }
        });    
};

exports.client = function(){
    return function(req,res){
        var colClients = dbmodule.Clients;
        var clientid = req.params.clientid;
        colClients.findOne({'_id': clientid},{},function(e, docs){
            res.render('singleclient', {'singleclient': docs});
            });
        };    
    };

exports.clientjson = function(){
    return function(req,res){
        var colClients = dbmodule.Clients;
        var clientid = req.params.clientid;
        colClients.findOne({'_id': clientid},'firstname lastname',function(e, doc){
            res.send(doc);
            });
        };    
    };

exports.servicej = function(){
    return function(req,res){
        var colServices = dbmodule.Services;
        var serviceid = req.params.serviceid;
        colServices.findOne({'_id': serviceid},{},function(e, doc){
            res.send(doc);
            });
        };    
    };

exports.expencejs = function(){
    return function(req,res){
        var colExpences = dbmodule.Expences;
        var expenceid = req.params.expenceid;
        colExpences.findOne({'_id': expenceid},{},function(e, doc){
            //console.log(doc.date.toLocaleDateString());
            res.send(doc);
            });
        };    
    };

exports.editevent = function(){
    return function(req,res){
        var colServices = dbmodule.Services;
        var eventid = req.params.eventid;        
        
        colServices.find({'eventid': eventid}, null, {'sort':{'_id':1}},function(e, docs){
            var colEvents = dbmodule.Events;                        
            colEvents.findOne({'_id': eventid}, null, {},function(e, doc){
                if(e){console.log(e);}
                else{
                var com = typeof(doc.comments);
                if(com == 'undefined'){                    
                    doc.comments = "no comments";                   
                    }                                
                res.render('editevent', {'services': docs, 'event': doc});                
                }
            });   
            });
        };    
    };

exports.getdaysummaryjs = function(){
    return function(req,res){
        var start = new Date(req.params.dt); //08:00 of the calendar day
        var end = new Date(req.params.dt);        
        end.setDate(end.getDate() + 1); //08:00 of the next calendar day
        var startiso = start.toISOString();
        var endiso = end.toISOString();        
        var colEvents = dbmodule.Events; 
        var colServices = dbmodule.Services;
        var startping = new Date(startiso);
        startping.setHours(startping.getHours() + 9);
        startpingiso = startping.toISOString();
        var endping = new Date(startiso);
        endping.setHours(startping.getHours() + 12);
        endpingiso = endping.toISOString(); 
        var daydata = new Object();
        daydata.total = 0;
        daydata.products = 0;
        daydata.hm = "";
        daydata.min = 0;
        daydata.check = [];
        daydata.notcliented = [];
        var totaldayprice = 0; 
        var totaldaypriceprod = 0;
        colEvents.find({start_date:{$gte: startiso}, end_date:{ $lte: endiso}}, {'_id':1, 'check':1, 'clientid':1}, function(error, eventlist){
            if(error){console.log(error);}    
            else{  
                            
                var cc = eventlist.length;   
                eventlist.forEach(function(event){
                    //console.log("CLIENT: " + event.clientid);    
                    if (event.check == 1){
                        daydata.check.push(event.id);
                        }
                    if (!event.clientid){
                        //console.log("EVENT: " + event.id + " CLIENT: " + event.clientid);    
                        daydata.notcliented.push(event.id);
                        }
                    colServices.aggregate()                    
                        .match({'eventid':event.id})
                        .group({_id:null, total:{$sum:"$price"}})
                        .exec(function(err, total){
                            if(total.length > 0){
                                //console.log(event.id + "  TOTAL: CHECK IF EVENT HAS SERVICES: " + total);
                                totaldayprice = totaldayprice + total[0].total;                            
                                //GET TOTAL FOR SERVICES PRODUCTS FOR THE EVENTID: 
                                colServices.aggregate()                    
                                    .match({'eventid':event.id, 'service':'PRODUCTS'})
                                    .group({_id:null, ptotal:{$sum:"$price"}})
                                    .exec(function(err, ptotal){
                                        if (err){
                                            console.log(err);
                                            }
                                        else{
                                            if(ptotal.length > 0){
                                                totaldaypriceprod = totaldaypriceprod + ptotal[0].ptotal;
                                                }
                                            }                                                                        
                                cc--;
                                if (cc <= 0){
                                    //console.log(startiso + " total: $" + totaldayprice);               
                                    //console.log(startiso + " total products: $" + totaldaypriceprod); 
                                    daydata.total = totaldayprice;                                
                                    daydata.products = totaldaypriceprod;
                                    }
                                })
                            }                                                          
                        })                                                
                });
            }
        });              
        var busy = 0;
        var count = 48;
        for(var i = 0; i <= 720; i += 15){
            ping = new Date(startpingiso);                                
            ping.setMinutes(ping.getMinutes() + i);
            pingiso = ping.toISOString();            
            colEvents.find({start_date:{$lte:pingiso}, end_date:{$gt:pingiso}}, function(er, events){
                if(events.length > 0){
                    busy = busy + 1;                                                            
                }
                count--;
                if (count <= 0){
                    if(busy > 0){
                        var m = busy * 15;
                        var hm = Math.floor(m / 60).toString() + ":" + (m % 60).toString();  
                        daydata.hm = hm;
                        daydata.min = m;
                        console.log(daydata);
                        res.send(daydata);
                    }
                    else{
                        res.send("");
                    }
                }                                                            
            });            
         }          
    }                  
};

exports.eventservicesj = function(){
    return function(req,res){
        var colServices = dbmodule.Services;
        var eventid = req.params.eventid;
        colServices.find({'eventid': eventid},null, {'sort':{'_id':1}},function(e, docs){
               //res.render('eventservices', {'services': docs});
               res.send(docs);
            });           
        };    
    };

exports.clientevents = function(){
    return function(req,res){
        var colEvents = dbmodule.Events;
        var clientid = req.params.clientid;
        colEvents.find({'clientid': clientid},null, {'sort':{'start_date':-1}},function(e, docs){
            var colClients = dbmodule.Clients;
            colClients.findOne({'_id': clientid}, {}, function(e, doc){
                res.render('clientevents', {'events': docs, 'cl': doc});
            });
            });
        };    
    };

exports.clientproducts = function(){
    return function(req, res){
        var colEvents = dbmodule.Events;
        var colClients = dbmodule.Clients;
        var colServices = dbmodule.Services;
        var clientid = req.params.clientid;
        var CEP = new Object();
        colClients.findOne({'_id': clientid}, {}, function(e, client){
            CEP.client = client;
            var cevents = [];
            CEP.events = [];//cevents;
            colEvents.find({'clientid': clientid},null, {'sort':{'start_date':-1}}, function(err, events){
                if(err){console.log(err);}
                else{                    
                    var count = events.length;                       
                    for(i = 0; i < events.length; i++){ 
                        var index = i;
                        CEP.events.push(events[index]);
                        CEP.events[index].products = [];
                        colServices.find({eventid:events[index].id, service:'PRODUCTS'}, function(err, services){
                            for(ii = 0; ii < services.length; ii++){
                                CEP.events[index].products.push(services[ii]);
                            }
                            count--;
                            if(count <= 0){                                
                                res.render('clientproducts', {'cep': CEP});        
                            }                                            
                        });
                        
                    }                     
                }
            });
        });
    }
}

exports.showcalendar = function(){
    return function(req, res){
        var dt = "";        
        if((!req.params.dt) || (req.params.dt == "today")){
            dt = new Date().toUTCString();            
        }
        else{
            var dt = req.params.dt;
        }
        res.render('calendar', {'dt': dt});
    };
};

exports.postdata = function(){
    return function(req, res){
        var data = req.body;
	var mode = data["!nativeeditor_status"];
	var sid = data.id;
	var tid = sid;
    delete data.id;
	delete data.gr_id;
	delete data["!nativeeditor_status"];

    function update_response(err, result){
		if (err)
			mode = "error";
		else if (mode == "inserted")
			tid = data._id;
		res.setHeader("Content-Type","text/xml");
		res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
	}

	if (mode == "updated"){
        data.start_date = new Date(data.start_date);
        data.end_date = new Date(data.end_date);
		db.events.updateById( sid, data, update_response);
            }
	else if (mode == "inserted"){
        data.start_date = new Date(data.start_date);
        data.end_date = new Date(data.end_date);
		db.events.insert(data, update_response);
            }
	else if (mode == "deleted")
		db.events.removeById( sid, update_response);
	else
		res.send("Not supported operation");
    }
    }

exports.getdata = function(){
    return function(req, res){
    //    var colEvent = dbmodule.Event;
    //    colEvent.find({}, null, function(err, data){
    //         for(var i = 0; i < data.length; i++){
    //             data[i].id = data[i]._id;
    //             res.send(data);
    //             }
                        
    //    });
    
    db.events.find().toArray(function(err, data){
		//set id property for all records
		for (var i = 0; i < data.length; i++)
			data[i].id = data[i]._id;		
		//output response
		res.send(data);    
});
}
}

exports.postcomments = function(){
    return function(req,res){
        var colComments = dbmodule.Comments;
        var post = parseInt(req.params.post);
        colComments.find({'post': post}, null, {sort:{'index':1}}, function(e, docs){
        var colPosts = dbmodule.Posts;
        colPosts.findOne({'post': post}, {}, function(e, postbody){
            res.render('postcomments', {'postcomments': docs, 'postbody': postbody});
            });         
        });
     };    
};

exports.postcommentsauthor = function(){
    return function(req,res){
        var colComments = dbmodule.Comments;
        var post = parseInt(req.params.post);
        colComments.find({'post': post}, null, {sort:{'index':1}}, function(e, docs){
        var colPosts = dbmodule.Posts;
        colPosts.findOne({'post': post}, {}, function(e, postbody){
            res.render('postcommentsuathor', {'postcomments': docs , 'postbody': postbody});
            });         
        });
     };    
};
 
exports.years = function(){    
    return function(req, res){
        var colPosts = dbmodule.Posts;
        colPosts.find().distinct("year", function(err, docs){
            res.render('yearlist', {'yearlist': docs.sort()});            
            });
    };        
};

exports.yui = function(req, res){
    res.render('yui', {title: 'YUI'});
    
    
    
    };

exports.ajax = function(req, res){
  //res.render('index', { title: 'Express' });
  res.send("hello vlad,,,,WHEEE");
};
