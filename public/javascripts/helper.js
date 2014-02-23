﻿$(document).ready(function(){
       	    
        $("#rollButton").click(function() {
	         //$("div.parent").toggle(200);  
          $.get("/a",function(data,status){ $("p.temp").text(data);});
        });	
        
        $('#birthday').datepicker();

        //$('#dateExpence').datepicker({format: "mm-dd-yyyy"});

        $('#newclientform').validate();

        var sMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        $('.month').each(function(){
            var sm = $(this).attr('id');
            var im = parseInt(sm);            
            var r = sMonths[im -1];
            $(this).html(r);            
            });

        $('button#search').click(function(){            
            var pattern = $('input#search').val();
            window.location.href="/clients/" + pattern;            
            });    
        $('input#active').change(function(){            
            var status = $('input#active').prop('checked');
            if (status == true){
                $('input#active').val(1);
            }
            else {
                $('input#active').val(0);
            }
        });
        
       

        $("button.showservices").click(function(){
			var id = this.id;
            var url = "/event/" + id + "/servicesj";
            var p = $("div[eventresult=" + id + "]");
            p.empty();     
            $.get(url, function(data){ 
                var total = 0;               
                $.each(data, function(key, val){
                    total = total + val.price;
                    var items = [];                        
                        items.push("<div class='col-sm-3'>" + val.service + "</div>" );
                        items.push("<div class='col-sm-2' style='float:left;'>$ " + val.price + ".00</div>" );
                        var comments = val.comments.replace(/\n/g, '<br>');
                        items.push("<div class='col-sm-7' style='overflow: auto;' >" + comments + "</div>" );
                        $("<div/>", { 
                    "class": "row",                    
                    html: items.join( "" )}).appendTo(p);
                }); 
                    var rowtotal = [];
                    rowtotal.push("<br/><div class='col-sm-3' style='float:left; font-weight:bold;'>TOTAL: </div>");
                    rowtotal.push("<div class='col-sm-2' style='float:left; font-weight:bold;'>$ " + total + ".00</div>");
                     $("<div/>", { 
                    "class": "row",
                    html: rowtotal.join( "" )}).appendTo(p);                    
                    });                                 
            var btn = $("a[id=" + this.id + "]");
            if ($(btn).hasClass("hidden")){                
                btn.removeClass("hidden").addClass("visible");
                }
            else{                
                 btn.removeClass("visible").addClass("hidden");
                }
            $("div[event=" + this.id + "]").collapse('toggle');             
		});  
            
        $("button.deleteservice").click(function(){

            var answer = confirm('Are you sure you want to delete this record?');
            
            if (answer){
			var serviceid = this.id;
            var eventid = $(this).attr('event');
            //alert("service: " + serviceid);
            //alert("event: " + eventid);
            var url = "/event/" + eventid + "/service/" + serviceid + "/delete";
            $.get(url, function(){                
                window.location.href="/event/" + eventid;                 
                });    
            }
            else{
                }          
		});  

         $("button.deleteexpence").click(function(){
            
            var answer = confirm('Are you sure you want to delete this record?');
            if (answer){
			    var expenceid = this.id;            
                var url = "/expence/" + expenceid + "/delete";
                $.get(url, function(data){                                
                    //$("#ModalExpence").modal('hide');
                    location.reload(true);                
                    });    
            }                   
		});  
         
         $("button.editexpence").click(function(){
            var row = $(this).closest("div.row");
            row.css("background-color", "darkgrey");
			var id = this.id;
            var url = "/expence/" + id;                        
            var items = [];
            $.get(url, function(data){  
                var dt = new Date(data.date);
                //alert(dt.toLocaleDateString());
                var dp = $('#dateExpence');
                dp.datepicker({format: "yyyy-mm-dd"});
                dp.datepicker('setValue', dt);                                       
                $("#priceExpence").val(data.price);
                $("#commentsExpence").val(data.comments);
                $("button.saveexpence").attr('id', data._id);
                $("#ModalExpenceLabel").text("EDIT EXPENCE: ");
                $("#ModalExpence").modal('show'); 
                $("button.saveservice").attr("id", data._id); 
                var type = data.type;       
                var stype = $("select#expences.selectpicker");
                if (type != ""){
                $("option:contains(" + type + ")").attr("selected", "selected");
                }
                else{
                $("option:contains('NOT SELECTED')").attr("selected", "selected");   
                }
                stype.selectpicker(); 
                stype.selectpicker('render'); 
                
                var payment = data.payment; 
                var spayment = $("select#payment.selectpicker");
                if (payment != ""){
                $("option:contains(" + payment + ")").attr("selected", "selected");
                }
                else{
                $("option:contains('NOT SELECTED')").attr("selected", "selected");   
                }
                spayment.selectpicker(); 
                spayment.selectpicker('render'); 
            });  
            
            $("button#cancel").click(function(){
                row.css("background-color", "transparent");
                });                                               
        });    
                
        $("button.editservice").click(function(){
            var row = $(this).closest("div.row");
            row.css("background-color", "darkgrey");
			var id = this.id;
            var url = "/service/" + id;            
            var p = $("div.container.xx");  
            p.empty();          
            var items = [];
            $.get(url, function(data){                 
                var service = data.service;                
                $("#priceService").val(data.price);
                $("#commentsService").val(data.comments);
                $("#ModalServiceLabel").text("EDIT SERVICE: ");
                $("#ModalService").modal('show'); 
                $("button.saveservice").attr("id", data._id);  
                var dd = $("select#services.selectpicker");
                if (service != ""){
                $("option:contains(" + service + ")").attr("selected", "selected");
                }
                else{
                $("option:contains('NOT SELECTED')").attr("selected", "selected");   
                }
                dd.selectpicker(); 
                dd.selectpicker('render'); 
            });  
            
            $("button#cancel").click(function(){
                row.css("background-color", "transparent");
                });                                               
        });        
});

function NewExpence(){                              
            var url = "/addexpence";                                    
            $.get(url, function(data){  
                var dt = data.date;                
                var dp = $('#dateExpence');
                dp.datepicker({format: "yyyy-mm-dd"});
                dp.datepicker('setValue', dt);                 
                $("#ModalExpenceLabel").text("NEW EXPENCE: ");
                $("#ModalExpence").modal('show'); 
                $("button.saveexpence").attr("id", data._id);                 
                var stype = $("select#expences.selectpicker");                
                $("option:contains('NOT SELECTED')").attr("selected", "selected");                   
                stype.selectpicker();                 
                stype.selectpicker('render'); 
                var spayment  = $("select#payment.selectpicker"); 
                $("option:contains('NOT SELECTED')").attr("selected", "selected");                   
                spayment.selectpicker(); 
                spayment.selectpicker('render');                 
            });  
}

function NewService(eventid){      
    $.get("/event/" + eventid + "/addservice", function(data){
        //$("#serviceService").val(data.service);
        var service = data.service;
        $("#priceService").val(data.price);
        $("#commentsService").val(data.comments);
        $("#ModalServiceLabel").text("EDIT SERVICE: ");
        $("#ModalService").modal('show'); 
        $("button.saveservice").attr("id", data._id);   
        var dd = $("select#services.selectpicker");
        $("option:contains('NOT SELECTED')").attr("selected", "selected");                   
        dd.selectpicker(); 
        dd.selectpicker('render');         
        });        
}

function ShowCalendar(dt){
     alert(dt);   
    
}

function SaveService(eventid){
            var serviceid = $("button.saveservice").attr("id");
            var url = "/service/" + serviceid + "/update";            
            //both of the following works:
            var service = $("li.selected a span").text();
            //var service = $("button.selectpicker[data-id='services']").attr("title")
            var price = $("#priceService").val();
            var comments = $("#commentsService").val();            
            $.post(url, {"id":serviceid, "service": service, "price": price, "comments": comments, "eventid": eventid}, function(data){                 
            window.location.href="/event/" + eventid;                    
            });                                
        }

function SaveExpence(){
            var expenceid = $("button.saveexpence").attr("id");              
            var url = "/expence/" + expenceid + "/update";                 
            var type = $("button[data-id='expences']").attr('title');
            if(type == "NOT SELECTED"){
                    alert("Select Expence Type.");
                    $("button[data-id='expences']").selectpicker({style:'btn-danger'}); 
                    return;
                }
            var payment = $("button[data-id='payment']").attr('title'); 
            if(payment == "NOT SELECTED"){
                    alert("Select Expence Payment.");
                    $("button[data-id='payment']").selectpicker({style:'btn-danger'});
                    return; 
                }           
            var price = $("#priceExpence").val();
            var comments = $("#commentsExpence").val();              
            var date = new Date($("#dateExpence").val());            
            date.setHours(date.getHours() + 9);            
            $.post(url, {"id":expenceid, "type": type, "price": price, "comments": comments, "payment": payment, "date": date}, function(data){                             
            alert(data);            
            $("#ModalExpence").modal('hide');
            location.reload(true);
            });                                
        }

function EditEvent(clientid){      
    var url = "/_clientjson/" + clientid;
    $.get(url, function(clientdata){         
        //Fill clients dropdown with clients:                 
        $.get("/clientsjson", function(data){
            var dd = $("select#clients.selectpicker");
            dd.empty();        
            var items = [];
            $.each(data,function(key, value){   
               //Set option selected for current clientid:
               if (value._id == clientid){                    
                    items.push("<option id=" + value._id + " selected='selected' > " + value.firstname + " " + value.lastname   + "</>"); 
               }
               else{items.push("<option id=" + value._id + "> " + value.firstname + " " + value.lastname   + "</>");}
            });
            dd.html(items.join(""));
            if(clientid == 'undefined'){
            $("#clients.selectpicker").selectpicker({style:'btn-danger'}); 
            }
            else{$("#clients.selectpicker").selectpicker(); }
            $("#clients.selectpicker").selectpicker('render'); //render to activate selected client
            //set id for each client li in dropdown:
            //$('div.btn-group.bootstrap-select').addClass("col-sm-3")
            $("ul.dropdown-menu li").each(function(){
                var li = $(this);
                li.attr("id", li.find("a").attr("id"));
            });            
            $("#ModalEvent").modal('show');  
        });       
    });  
 }

function SaveEvent(eventid){
    var clientid = $("li.selected").attr("id");
    var text = $("#textEvent").val();
    var comments = $("#commentsEvent").val();  
    var check;
    if ($("#check").is(':checked')){
            check = 1;
            }
    else{
        check = 0;
        }                 
        var url = "/event/" + eventid + "/update";    
        $.post(url, {"eventid":eventid, "clientid": clientid, "text": text, "comments": comments, "check": check}, function(data){   
           window.location.href="/event/" + eventid;                    
            });   
    }

function GetClientName(clientid){
    if (clientid == ""){
        var clientname = "You have to assign Client for this Event!";
        alert(clientname);      }
    else{        
        var url = "/_clientjson/" + clientid;
        $.get(url, function(clientdata){             
            var clientname = clientdata.firstname + " " + clientdata.lastname;            
            $("#clientname").text(clientname);  
            //$("#list").removeClass("hidden").addClass("visible");                 
            $("#list").removeAttr("disabled");
         });         
    }
}	

function GetDaySummary(){    	
            var year = $('div.dhx_cal_date').text();
            year = year.substring(year.length - 4);
            //SINGLE DAY FOR DEBUGGING: 
            //var bar = $('div.dhx_scale_bar').eq(1); //0-bazed
            //    var day = bar.text().substring(0,3); 
            //    //alert(day);       
            //    var dt = new Date(bar.text() + " " + year).toISOString();
            //    var url = "/getdaysummary/" + dt;        
            //    $.get(url, function(data){                     
            //      //$("td[d=" + day + "]").text(result.substring(0, 10)); 
            //      var ph = data.total / data.min * 60; 
            //      $("td[d=" + day + "]").text("$" + data.total + ".00 / " + data.hm + " = $" + ph);
            //    });  
            var wtotal = 0;
            var wtotalservices =0;
            var wproducts = 0;
            var wmin = 0;   
            var count = $('div.dhx_scale_bar').length;                           
            $('div.dhx_scale_bar').each(function(){  
                var day = $(this).text().substring(0,3);        
                var dt = new Date($(this).text() + " " + year).toISOString();
                var url = "/getdaysummary/" + dt;                                          
                $.get(url, function(data){
                  if (data != "") {                    
                    var total = data.total;
                    var products = data.products;
                    var min = data.min;
                    var hm = data.hm;
                    var totalservices = total - products;
                    var ph = Number(totalservices / min * 60).toFixed(2);                                        
                    $("td[d=" + day + "]").html("Services $" + totalservices + ".00<br/>Time: " + hm + "<br/>PH: $" + ph + "<br/>Products: $" + products + ".00<br/>Total: $" + total + ".00");    
                    for(var i = 0; i < data.check.length; i++){
                       $("div.dhx_cal_event[event_id=" + data.check[i] + "] div.dhx_body").css("font-weight", "bold").css("background-color","#e5ce9a").css("color","#2e3444");  
                    } 
                    for(var i = 0; i < data.notcliented.length; i++){
                       $("div.dhx_cal_event[event_id=" + data.notcliented[i] + "] div.dhx_event_move.dhx_title").css("font-weight", "bold").css("background-color","red").css("color","#2e3444");  
                    } 
                    wtotal = wtotal + total;
                    wtotalservices = wtotalservices + totalservices;
                    wproducts = wproducts + products;
                    wmin = wmin + min;                                                    
                  }
                  count--;
                  if (count <= 0){                    
                    var wph = Number(wtotalservices / wmin * 60).toFixed(2);                    
                    var whm = Math.floor(wmin / 60).toString() + ":" + (wmin % 60).toString();  
                    $("td[d='Sun']").html("Services $" + wtotalservices + ".00<br/>Time: " + whm + "<br/>PH: $" + wph + "<br/>Products: $" + wproducts + ".00<br/>Total: $" + wtotal + ".00").css("font-weight","bold");       
                  }
                });                 
            });                 
}

function GetMonth(iMonth){
    var sMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var int = parseInt(iMonth);
    alert(sMonths[int]);
    return sMonths[int];        
    }