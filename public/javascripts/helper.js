$(document).ready(function(){
	    
        $("#rollButton").click(function() {
	         //$("div.parent").toggle(200);  
          $.get("/a",function(data,status){ $("p.temp").text(data);});
        });	
        
        $('#birthday').datepicker();

        $('#newclientform').validate();

        

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
            $("#clients.selectpicker").selectpicker(); 
            $("#clients.selectpicker").selectpicker('render'); //render to activate selected client
            //set id for each client li in dropdown:
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
        var url = "/event/" + eventid + "/update";    
        $.post(url, {"eventid":eventid, "clientid": clientid, "text": text, "comments": comments}, function(data){   
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

