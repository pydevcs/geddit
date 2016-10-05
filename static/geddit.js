'use strict';
var redirect_uri = "https://pydevcs.github.io/geddit/auth.html";
var client_id = "7NeqizMXmEZFKA";

var more = "More<img src='static/img/lbl-arw-dwn.svg' width='7px' height='4px'>";
var less = "Less<img src='static/img/lbl-arw-up.svg' width='7px' height='4px'>";

$(function() {
	$("#more").click(function () {
	    ($("#more").html() === less) ? $("#more").html(more) : $("#more").html(less);
	    $("#side-bar-more").slideToggle(50);
	});
});

function randStr() {
  var exports = {};
  exports.uuid4 = function () {
    var uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
      switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += (Math.random() * 4 | 8).toString(16);
        break;
      default:
        uuid += (Math.random() * 16 | 0).toString(16);
      }
    }
    return uuid;
  };
  return exports.uuid4();
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function setCookie(cname, cvalue) {
    var expiration;
    var d = new Date();
    switch(cname) {
	    case "code":
	        expiration = 60*60*1000;     //1 hour expiration in ms
	    case "refresh":
	        expiration = 60*60*1000;     //1 hour expiration in ms
	    case "state":
	        expiration = 30*24*60*60*1000;     //30 day expiration in ms
    }
    d.setTime(d.getTime() + expiration);
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
	    //check for and truncate empty space
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        //is cname cookie string at first index positon?
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getToken(code) {
    $.ajax({
      url: 'https://ssl.reddit.com/api/v1/access_token',
      beforeSend: function (request) {
          request.setRequestHeader('Authorization', 'Basic ' + btoa('7NeqizMXmEZFKA:'));
      },
      type: 'POST',
      dataType: 'json',
      data: {
	      "grant_type": "authorization_code",
	      "code" : code,
	      "redirect_uri": redirect_uri
	  },
      success: function(data) {
	      var token = data.access_token;
	      var refresh_token = data.refresh_token;
	      console.log("Token: " + token);
	      setCookie('token', token);	      
	      setCookie('refresh', refresh_token);
	  },
      error: function(error) {
	      console.log(error);
	  }
    });
}

function refresh() {
	var refresh_token = getCookie('refresh');
    $.ajax({
      url: 'https://ssl.reddit.com/api/v1/access_token',
      beforeSend: function (request) {
          request.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ':'));
      },
      type: 'POST',
      dataType: 'json',
      data: {
	      "grant_type": "refresh_token",
	      "refresh_token" : refresh_token,
	      "redirect_uri": redirect_uri
	  },
      success: function(data) {
	      var new_token = data.access_token;
	      console.log("New Token: " + new_token);
		  setCookie('token', new_token);
	  },
      error: function(error) {
	      console.log(error);
	  }
    });
}

function getAuth() {
	var code = getUrlParameter("code");
	var state = getUrlParameter("state");
    if (code != "") {
		setCookie("code", code);
		if (state == getCookie("state")) {
				getToken(code);
		}
		else {
			alert("State string does not match!");
		}
    }
    else {
	    alert("Access Code Error!");
	}
}

function checkAuth(kind, permalink) {
    var token=getCookie("token");
    if (token != "") {
        //geddit(token, "subreddits", "/subreddits/mine/subscriber?limit=100"); //subreddits
        //geddit(token, "name", "/api/v1/me"); //username
		//geddit(token, 'front', "/?limit=50"); //front page
		$("#mid-box-rgt").data( "subreddit", permalink );
		geddit(token, kind, permalink);
		
    } else {
	    var random_str = randStr();
		setCookie("state", random_str);
		var auth_url = "https://ssl.reddit.com/api/v1/authorize?client_id=" +
		client_id +
		"&response_type=code&state=" + 
		random_str +
		"&redirect_uri=" +
		redirect_uri +
		"&scope=edit history identity mysubreddits privatemessages read save submit subscribe vote" +
		"&duration=permanent";	
		window.location.assign(auth_url);
    }
}

function geddit(token, kind, endpoint) {
    $.ajax({
      url: 'https://oauth.reddit.com' + endpoint,
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
      },
      type: 'GET',
      dataType: 'json',
      retryLimit : 4,
      success:function(data){ jsonCallback(data, kind); },
      error: function(error) {
	      console.log(error);
          if (this.retryLimit == 4) {
	          refresh();
          }
          this.retryLimit--;
          if (this.retryLimit) {
              $.ajax(this)
              return;
          }
	  }
    });
}


var mail_item = "&lt;img class='box vote' src='static/img/box.svg' width='14px' height='14px'&gt;" +
				 "&lt;img class='star vote' src='static/img/star.svg' width='14px' height='13px'&gt;" +
				 "&lt;img class='imprtnt' src='static/img/imprtnt.svg' width='14px' height='11px'&gt;" +
				 "&lt;a class='mail-title' href='https://www.reddit.com"; 

function jsonCallback(json, kind) {
	switch(kind) {	
		case "name":
			console.log(json);
			console.log(json.name);
			break;
		case "subreddits":
			console.log(json);
			var after = json.data.after;
			console.log(after);
			$.each(json.data.children, function (i, ob) {
				for (var key in ob.data) {
				  if (ob.data.hasOwnProperty(key)) {
					  if (key == "display_name") {
					      $("ul#subs").append("<li>" + ob.data[key] + "</li>");  
					  }
				  }
				}	
			});
			break;
		case "front":
			console.log(json.data);
			var after = json.data.after;
			$("#mid-box-rgt").data( "after", after );
			
			var main_list = "";
			$.each(json.data.children, function (i, ob) {
				//var timeAgo = moment.unix(ob.data.created_utc).fromNow(false);   //false includes "ago"
				var postdate = moment.unix(ob.data.created_utc).format("MMM D");
				var post = "&lt;div class='mail-item' data-id='" + ob.data.name + "' data-dir='" + ob.data.likes + "'&gt;" +
				mail_item + ob.data.permalink  + "'&gt;" + 
				ob.data.subreddit + "&lt;/a&gt;&lt;div class='mail-info'&gt;&lt;a href='" + ob.data.url + "'&gt;" + 
				ob.data.title + "&lt;/a&gt;&lt;/div&gt;&lt;div class='mail-date'&gt;" +
				postdate + "&lt;/div&gt;&lt;/div&gt;";
				var rendered_link = $('<div />').html(post).text();
				main_list += rendered_link;
			});
			$("#main-list").html(main_list);
			$("#main-list").scrollTop(0);
			break;
		default:
			console.log(json);
	}
}

function vote(data_id, dir, objct) {
	var token=getCookie("token");
    $.ajax({
      url: 'https://oauth.reddit.com/api/vote',
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
          //request.setRequestHeader("User-Agent", "Geddit by u/pydevcs");
      },
      type: 'POST',
      data: { id: data_id, dir: dir },
      dataType: 'json',
      success:function(){
      	  if (dir == 1){
	      	$(objct).attr("src","static/img/upstar.svg");	      	  
      	  }
      	  if (dir == -1){
	      	$(objct).attr("src","static/img/downbox.svg");
      	  }
      	  if (dir != 0) {
	      	$(objct).attr("data-dir", "0");
      	  }
      	  
      	  $(objct).data('dir', null);
      },
      error: function(error, textStatus, xhr) {
	      console.log("UpVote Error: " + error);
	      console.log(xhr.status);
	  }
    });
}

//$(document).on('click', '.vote', function(event) {
//    var data_id = $(this).parent().attr("data-id");
//    var dir = $(this).parent().attr("data-dir");
//	vote(data_id, dir, this);
//});


$(document).on('click', '.vote', function(event) {
	var token=getCookie("token");
	var data_id = $(this).parent().attr("data-id");
	var dir = $(this).parent().attr("data-dir");
	var cls = $(this).attr("class");
	if (cls == "star vote") {
		if (dir || dir == false) {
			dir = 0;
			console.log("unvote");
		}
		else {
			dir = 1;
			console.log("upvote");
		}
	}
	if (cls == "box vote") {
		if (dir || dir == false) {
			dir = 0;
			console.log("unvote");
		}
		else {
			dir = -1;
			console.log("downvote");
		}
	}
    $.ajax({
      url: 'https://oauth.reddit.com/api/vote',
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
          //request.setRequestHeader("User-Agent", "Geddit by u/pydevcs");
      },
      type: 'POST',
      data: { id: data_id, dir: dir },
      dataType: 'json',
      success:function(){
	      if (dir == 1) {
	      	  $(event).attr("src","static/img/upstar.svg");
	      	  $(event).data('dir', true);
	      }
	      if (dir == -1) {
	      	  $(event).attr("src","static/img/downbox.svg");
	      	  $(event).data('dir', false);
	      }
	      if (dir == 0) {
		      $(event).data('dir', null);
		      if (cls == "star vote") {
			      $(event).attr("src","static/img/star.svg");
		      }
		      else {
			      $(event).attr("src","static/img/box.svg");
		      }
	      } 
      },
      error: function(error, textStatus, xhr) {
	      console.log("UpVote Error: " + error);
	      console.log(xhr.status);
	  }
    });
});


$(document).on('click', '.mail-date', function(event) {
	console.log($(this).attr("class"));
});

$(function() {
    $("input.search").focus(function(){
	    if (!$("input.search").val()) {
        	$("input.search").val("/r/");		    
	    }
    });
});

$(function() {
    $("#mid-box-rgt").click(function(){
	    var after = $("#mid-box-rgt").data("after");
	    var subreddit = $("#mid-box-rgt").data("subreddit");
	    checkAuth('front', subreddit + "&after=" + after); //front page
    });
});

$(function() {
    $("#top-magnify").click(function(){
	    var sub_search = $("input.search").val();
	    sub_search += ".json?limit=50";
	    $("#mid-box-rgt").data( "subreddit", sub_search );
        checkAuth('front', sub_search);
    });
});

$(function(){
    $(".srchbar").keypress(function (e) {
        var space = (e.keyCode == 32);
        var enter = (e.keyCode == 13);
        if (space || enter) {
		    var sub_search = $("input.search").val();
		    sub_search += ".json?limit=50";
			$("#mid-box-rgt").data( "subreddit", sub_search );
	        checkAuth('front', sub_search);
        }
    });
});
