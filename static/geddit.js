"use strict";
var redirect_uri = "https://pydevcs.github.io/geddit/";
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
    var uuid = "", ii;
    for (ii = 0; ii < 32; ii += 1) {
      switch (ii) {
      case 8:
      case 20:
        uuid += "-";
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
      case 12:
        uuid += "-";
        uuid += "4";
        break;
      case 16:
        uuid += "-";
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
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function setCookie(cname, cvalue) {
    var expiration = 30*24*60*60*1000; //30 day cookie expiration in ms;
    var d = new Date();
    d.setTime(d.getTime() + expiration);
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        //check for and truncate empty space
        while (c.charAt(0)==" ") {
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
    var promise = $.ajax({
      url: "https://ssl.reddit.com/api/v1/access_token",
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":"));
      },
      type: "POST",
      dataType: "json",
      data: {
          "grant_type": "authorization_code",
          "code" : code,
          "redirect_uri": redirect_uri
      }
    })
    .done(function(auth_resp) {
      var token = auth_resp.access_token;
      setCookie("token", token);
      console.log("Token " + token);
      var refresh_token = auth_resp.refresh_token;
      setCookie("refresh", refresh_token);
      window.location.assign(redirect_uri);
      
    }).fail(function() {
      console.log("Access Token Error");
    });
}

function refresh(endpoint) {
    var code = getCookie("refresh");
    var promise = $.ajax({
      url: "https://ssl.reddit.com/api/v1/access_token",
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":"));
      },
      type: "POST",
      dataType: "json",
      data: {
          "grant_type": "refresh_token",
          "refresh_token" : code,
          "redirect_uri": redirect_uri
      }
    })
    .done(function(auth_resp) {
	  //move this into to the if loop below after test phase
      var token = auth_resp.access_token;
      setCookie("token", token);
      console.log("Token " + token);
      if (typeof endpoint == "string") {
	      geddit(token, endpoint);
      } else {
	      vote(endpoint);
      }
    })
    .fail(function() {
      console.log("Error Refreshing Token");
    });
}

function checkAuth(permalink) {
    var token=getCookie("token");
    var str_tst = permalink.includes(".json?limit=50");
    if (!str_tst) {
        permalink += ".json?limit=50";
    }
    if (token != "") {
	    $("img#top-profile").attr("title", "Logged In");
        setCookie("subreddit", permalink);
        geddit(token, permalink);
    }
    else {
        if(document.location.search.length) { // query string exists
            var code = getUrlParameter("code");
            var state = getUrlParameter("state");
            if (code != "") {
                if (state == getCookie("state")) {
                    getToken(code);
                }
                else {
                    console.log("State string does not match!");
                }
            }
        } else { //not logged in
	        var url = getCookie("subreddit");
	        if (!url || permalink == "/.json?limit=50") {
		        url = "https://www.reddit.com/r/all.json?limit=50";
	        }
	        else if (permalink[0] == "/") {
		        url = "https://www.reddit.com" + permalink;
	        }
            var promise = $.ajax({
                url: url,
                type: "GET",
                dataType: "json"
            })
            .done(function(json_data) {
                renderContent(json_data, url);
            })
            .fail(function( jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 404) {
                    alert( "The page you requested does not exist" );
                }
                if (jqXHR.status == 401) {
                    console.log("Token Expired")
                    refresh(endpoint); 
                }
                else {
	                console.log("checkAuth not logged in error");
	                console.log(jqXHR.status);
                    console.log(endpoint);
                    //alert( "Something went wrong :/" );  
                }
            });
        }
    }
}

function geddit(token, endpoint){
    var promise = $.ajax({
      url: "https://oauth.reddit.com" + endpoint,
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
      },
      type: "GET",
      dataType: "json"
    })
    .done(function(json_data) {
      renderContent(json_data, endpoint);
    })
    .fail(function( jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            alert( "The page you requested does not exist" );
        }
        if (jqXHR.status == 401) {
            console.log("Token Expired")
            refresh(endpoint);   
        }
        else {
	    console.log("geddit Error");
	    console.log(jqXHR.status);
	    console.log(endpoint);
        }
    });
}

function renderContent(json, endpoint) {
    console.log(json.data);
    var after = json.data.after;
    var after_removed = endpoint.split("&after=");
    endpoint = after_removed[0] + "&after=" + after;
    setCookie("subreddit", endpoint);
    var NSFW = getCookie("NSFW");
    var main_list = "";
    $.each(json.data.children, function (i, ob) {
        if (NSFW == "true") {
            if (ob.data.over_18) {
	            return;
	        }   
	    }
        var postdate = moment.unix(ob.data.created_utc).format("MMM D");
        //var timeAgo = moment.unix(ob.data.created_utc);
        //timeAgo = moment(timeAgo).local().fromNow(false); //get local time since posted
        var post = "&lt;div class='mail-item' data-id='" + ob.data.name + "' data-dir='" + ob.data.likes + "'&gt;" +
        "&lt;img class='box vote' src='" + box(ob.data.likes) + "' width='14px' height='14px'&gt;" +
        "&lt;img class='star vote' src='" + star(ob.data.likes) + "' width='14px' height='13px'&gt;" +
        "&lt;img class='imprtnt' src='static/img/imprtnt.svg' width='14px' height='11px'&gt;" +
        "&lt;div class='mail-title' &gt;" +
        ob.data.subreddit + "&lt;/div&gt;&lt;a href='" + ob.data.url + "'&gt;&lt;div class='mail-info'&gt;" +
        ob.data.title + selfTxt(ob.data.selftext) + "&lt;/div&gt;&lt;/a&gt;" + 
        nsfwTag(ob.data.over_18) +
        "&lt;a class='mail-date' href='https://reddit.com" + ob.data.permalink +"' &gt;" +
        postdate + "&lt;/a&gt;&lt;/div&gt;";
        var rendered_link = $("<div />").html(post).text();
        main_list += rendered_link;
    });
    $("#main-list").html(main_list);
    $("#content").scrollTop(0);
}

function selfTxt(post) {
    if (post != "") {
        return "&lt;span&gt; - " + post + "&lt;/span&gt;";  
    } else {
	    return post;
    }
}

function nsfwTag(filter) {
	if (filter) {
		return "&lt;img class='attach' src='static/img/nsfw.svg' width='16px' height='8px'&gt";
	}
	else {
		return "";
	}
}

function star(likes) {
    if (likes) {
         return "static/img/upstar.svg";
    }
    else {
        return "static/img/star.svg";
    }
}

function box(likes) {
    if (likes == false) {
        return "static/img/downbox.svg";
    }
    else {
         return "static/img/box.svg";
    }
}

function vote(div) {
    var token=getCookie("token");
    if (!token) {
	    alert("You must be logged in to do that :]");
        return;
    }
    var data_id = div.parent().attr("data-id");
    var dir = div.parent().attr("data-dir");
    var cls = div.attr("class");
    switch(cls) {
    case "star vote":
        if (dir == "true") {
            dir = 0;
        }
        if (dir == "null" || dir == "false") {
            dir = 1;
        }
        break;
    case "box vote":
        if (dir == "false") {
            dir = 0;
        }
        if (dir == "null" || dir == "true") {
            dir = -1;
        }
        break;
    }
    var promise = $.ajax({
      url: "https://oauth.reddit.com/api/vote",
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
      },
      type: "POST",
      data: { id: data_id, dir: dir },
      dataType: "json"
    })
    .done(function(json_data) {
	    switch(cls) {
	    case "star vote":
	        if (dir == 0) {
	            div.attr("src","static/img/star.svg");
	            div.parent().attr("data-dir", "null");
	        }
	        if (dir == 1) {
	            div.attr("src","static/img/upstar.svg");
	            div.siblings(".box").attr("src","static/img/box.svg");
	            div.parent().attr("data-dir", "true");
	        }
	        break;
	    case "box vote":
	        if (dir == 0) {
	            div.attr("src","static/img/box.svg");
	            div.parent().attr("data-dir", "null");
	        }
	        if (dir == -1) {
	            div.attr("src","static/img/downbox.svg");
	            div.siblings(".star").attr("src","static/img/star.svg");
	            div.parent().attr("data-dir", "false");
	        }
	        break;
	    }
    })
    .fail(function() {
      console.log("Voting Error")
      refresh(div);
    });
}

$(document).on("click", ".vote", function() {
    vote($(this));
});

$(document).on("click", "img#top-profile", function() {
    var token=getCookie("token");
    if (token == "") {
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
});

$(document).on("click", "img#top-apps", function() {
    var NSFW = getCookie("NSFW");
    if (NSFW == "true") {
        setCookie("NSFW", "false");
    } else {
        setCookie("NSFW", "true");
    }
    var subreddit = getCookie("subreddit");
    subreddit = subreddit.split("&after=");
    subreddit = subreddit[0];
    if (subreddit == "https://www.reddit.com/r/all.json?limit=50") {
	    setCookie("subreddit", subreddit);
    }
    checkAuth(subreddit);
 });

$(document).on("click", "#mid-box-gear", function() {
    document.cookie = "state" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "refresh" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "subreddit" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "NSFW" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Logged Out');
    window.location.assign(redirect_uri);
});

$(document).on("click", ".imprtnt", function(event) {
    console.log("Open iFrame");
});

$(document).on("click", ".mail-title", function(event) {
    var set_sub = "/r/" + $(this).text();
    setCookie("subreddit", set_sub);
    checkAuth(set_sub);
});

$(document).on("click", ".tab", function() {
    $(".tab").removeClass("active");
    $(this).addClass("active");
});

$(document).on("click", "#refresh", function() {
    var subreddit = getCookie("subreddit");
    subreddit = subreddit.split("&after=");
    subreddit = subreddit[0];
    if (subreddit == "https://www.reddit.com/r/all.json?limit=50") {
	    setCookie("subreddit", subreddit);
    }
    checkAuth(subreddit);
});

$(function() {
    $("#mid-box-rgt").click(function(){
        var subreddit = getCookie("subreddit");
        checkAuth(subreddit);
    });
});

$(function() {
    $("input.search").focus(function(){
        if (!$("input.search").val()) {
            $("input.search").val("/r/");
        }
        else {
	        $("input.search").val("/r/");
        }
    });
});

$(function() {
    $("#top-magnify").click(function(){
        var sub_search = $("input.search").val();
        setCookie("subreddit", sub_search);
        checkAuth(sub_search);
    });
});

$(function(){
    $(".srchbar").keypress(function (e) {
        var space = (e.keyCode == 32);
        var enter = (e.keyCode == 13);
        if (space || enter) {
            var sub_search = $("input.search").val();
            setCookie("subreddit", sub_search);
            checkAuth(sub_search);
        }
    });
});