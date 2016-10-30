"use strict";
var redirect_uri = "https://pydevcs.github.io/geddit/";
var client_id = "7NeqizMXmEZFKA";

//routing function
(function(){
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    history.replaceState(null, null, redirect);
    var path = window.location.pathname;
    path = path.split("/");
    console.log(path);
    console.log(path[3]);
    if (path.length == 3) {
        console.log("Pathname is too short, 404 message");
    }
    if (path.length > 5 && path[5] != "") {
        console.log("Pathname is too long, 404 message");
    }
    if (path.length == 5) {
        console.log(path[4]);
    }
    var queryStr = window.location.search;	
    if (queryStr) {
        queryStr = queryStr.substring(1);
	    var params = {}, queries, temp, i, l;
	    // Split into key/value pairs
	    queries = queryStr.split("&");
	    // Convert the array of strings into an object
	    for ( i = 0, l = queries.length; i < l; i++ ) {
	        temp = queries[i].split('=');
	        params[temp[0]] = temp[1];
	    }
	    console.log(params);	        
    }
  }
  else {
    console.log("r/all");
  }
})();

var nsfw_svg = "&lt;svg class='attach' xmlns='http://www.w3.org/2000/svg' width='16' height='8' viewBox='0 0 16 8'&gt;" +
               "&lt;path d='M15.6 1.5c-0.5-0.9-1.6-1.5-2.7-1.5 -2.9 0-5.8 0-8.8 0 -0.9 0-1.9 0.3-2.6 0.9 "+
               "-0.6 0.5-1.1 1.1-1.3 1.8C-0.1 3.5-0.1 4.4 0.2 5.2 0.4 6 1 6.7 1.7 7.2 2.2 7.6 2.9 7.9 " +
               "3.6 8 4 8 4.4 8 4.8 8c2.1 0 4.1 0 6.2 0 0.2 0 0.3-0.1 0.4-0.2 0.1-0.2 0-0.5-0.2-0.6 -0.1 " +
               "0-0.1 0-0.2 0 -2.2 0-4.4 0-6.6 0C4 7.2 3.6 7.2 3.2 7.1c-0.9-0.2-1.6-0.8-2-1.6C0.9 5 0.8 " +
               "4.4 0.9 3.8c0-0.9 0.5-1.7 1.1-2.2C2.6 1.1 3.4 0.8 4.2 0.8c2.9 0 5.8 0 8.7 0 0.7 0 1.5 0.4 " +
               "1.9 1 0.4 0.5 0.5 1.2 0.3 1.8 -0.2 0.6-0.7 1.1-1.2 1.3 -0.3 0.1-0.5 0.2-0.8 0.2 -2.8 0-5.6 " +
               "0-8.3 0 -0.3 0-0.6 0-0.9-0.1C3.1 4.9 2.7 4.2 2.8 3.6c0.1-0.5 0.7-0.9 1.2-1 2.6 0 5.3 0 7.9 " +
               "0 0.3 0 0.5-0.3 0.4-0.5 0-0.2-0.2-0.3-0.4-0.3 -2.7 0-5.3 0-8 0C3.4 1.8 2.9 2.1 2.5 2.5 2.2 " +
               "2.8 2 3.2 2 3.6 1.9 4.1 2 4.5 2.3 4.9c0.4 0.5 1 0.9 1.6 1C4.1 5.9 4.3 5.9 4.4 5.9c2.8 0 5.6 " +
               "0 8.5 0 0.7 0 1.3-0.2 1.8-0.6 0.6-0.4 1.1-1.1 1.2-1.8C16.1 2.9 16 2.1 15.6 1.5z' fill='#D23D29'/&gt;" +
               "&lt;/svg&gt;";

var imprtnt_svg = "&lt;svg class='imprtnt' xmlns='http://www.w3.org/2000/svg' width='14' height='11' viewBox='0 0 14 11'&gt;" +
                  "&lt;polygon points='10.1 0.9 0.9 0.9 0.9 10.1 10.1 10.1 13 5.4 ' fill='#FFF'/&gt;" +
                  "&lt;path d='M10.6 0H0v11h10.6l3.4-5.6L10.6 0zM0.9 10.1V0.9h9.2L13 5.4l-2.9 4.7H0.9z' fill='#C6C6C5'/&gt;&lt;/svg&gt;";

$(function() {
    $(".drp-txt").click(function () {
        $("#less").toggle();
        $("#more").toggle();
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
      localStorage.token = token;
      localStorage.refresh = auth_resp.refresh_token;
      var endpoint = sessionStorage.subreddit;
      if (endpoint.includes("r/all.json?limit=50")) {
	      endpoint = "/.json?limit=50";   
      }
      endpoint = endpoint.split("&after=");
      endpoint = endpoint[0];
      sessionStorage.subreddit = endpoint;
      console.log("Logged in");
      window.location.assign(redirect_uri);
    }).fail(function() {
      console.log("Access Token Error");
    });
}

function refresh(voteObj) {
    var code = localStorage.refresh;
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
      var token = auth_resp.access_token;
      localStorage.token = token;
      console.log("Token " + token);
      if (!voteObj) {
	      geddit(token);	      
      } else {
	      vote(voteObj);
      }
    })
    .fail(function() {
      console.log("Error Refreshing Token");
    });
}

function checkAuth() {
    var token = localStorage.token;
    if (token) {
        geddit(token);
    }
    else {
        if (document.location.search.length) { // query string exists
            var code = getUrlParameter("code");
            var state = getUrlParameter("state");
            if (code != "") {
                if (state == sessionStorage.state) {
                    getToken(code);
                }
                else {
                    console.log("State string does not match!");
                }
            }
        } else { geddit(false); }
    }
}

function geddit(token){    
    var endpoint = sessionStorage.subreddit;
    var url;
    if (!token) {
	    url = "https://www.reddit.com";
	    if (!endpoint || 0 === endpoint.length) {
	        endpoint = "/r/all.json?limit=50";
	        sessionStorage.subreddit = endpoint;
	    }
    } else {
	    url = "https://oauth.reddit.com";
    }
    //console.log(endpoint);
    var promise = $.ajax({
      url: url + endpoint,
      beforeSend: function (request) {
          if (token) {
	          request.setRequestHeader("Authorization", "bearer " + token);
	          // fix this with tooltips !! $("svg#top-profile").attr("title", "Logged In");
          }
      },
      type: "GET",
      dataType: "json"
    })
    .done(function(json_data) {
        setTab(endpoint);
	    if (json_data.data.children.length == 0) {
		    alert("The Page You Requested Does Not Exist");
	    } else {
            renderContent(json_data, endpoint);		    
	    }
    })
    .fail(function( jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            alert( "The page you requested does not exist" );
        }
        if (jqXHR.status == 401) {
            console.log("Token Expired")
            refresh(false);   
        }
        else {
        console.log("geddit Error");
        console.log(errorThrown);
        }
    });
}

function renderContent(json, endpoint) {
    //console.log(json.data);
    var after = json.data.after;
	setCookie("after", after);
	var before = json.data.before;
	setCookie("before", before);
	if (before != null) {
		console.log("Before " + before);
	} else {
		setCookie("count", 0);
	}
    var NSFW = localStorage.nsfw;
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
        box(ob.data.likes) +
        star(ob.data.likes) +
        imprtnt_svg +
        "&lt;div class='mail-title' &gt;" +
        ob.data.subreddit + "&lt;/div&gt;&lt;a href='" + ob.data.url + "'&gt;&lt;div class='mail-info'&gt;" +
        ob.data.title  + "&lt;/div&gt;&lt;/a&gt;" + 
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

function setTab(endpoint) {
    var tab = endpoint.split(".json?limit=50");
    var tabSplit = tab[0].split("/");
    var tabLen = tabSplit.length;
    var tabID = tabSplit[tabLen - 1];
    //console.log(tabSplit);
    switch (tabID) {
    default:
        tabID = "#tab-hot";
        break;
    case "hot":
        tabID = "#tab-hot";
        break;
    case "new":
        tabID = "#tab-new";
        break;
    case "top":
        tabID = "#tab-top";
        break;
    }
	$(".tab").removeClass("active");
    $(tabID).addClass("active");
}

function nsfwTag(filter) {
	if (filter) {
		return nsfw_svg;
	}
	else {
		return "";
	}
}

function star(likes) {
    if (likes) {
        return "&lt;div class='star vote' &gt;" +
               "&lt;svg class='svghide' xmlns='http://www.w3.org/2000/svg' width='14' height='13' viewBox='0 0 14 13'&gt;" +//start star.svg
               "&lt;polygon points='8.6 5.7 7 1.9 5.4 5.7 1.9 5.7 4.4 8.1 3.8 11.6 7 10 10.2 11.6 9.6 8.1 12.1 5.7 ' fill='#FFF'/&gt;" +
               "&lt;path d='M9.1 4.9L7 0 4.9 4.9 0 4.9l3.6 3.4L2.7 13 7 10.8 11.3 13l-0.8-4.7L14 4.9 9.1 4.9zM10.2 " +
               "11.6L7 10l-3.2 1.7 0.6-3.6L1.9 5.7l3.5 0L7 1.9l1.6 3.8 3.5 0L9.6 8.1 10.2 11.6z' fill='#C6C6C6'/&gt;&lt;/svg&gt;" +//end star.svg
               "&lt;svg xmlns='http://www.w3.org/2000/svg' width='14' height='13' viewBox='0 0 14 13'&gt;" +//start upstar.svg
               "&lt;polygon points='8.6 5.7 7 1.9 5.4 5.7 1.9 5.7 4.4 8.1 3.8 11.6 7 10 10.2 11.6 9.6 8.1 12.1 5.7 ' fill='#FED675'/&gt;" +
               "&lt;path d='M9.1 4.9L7 0 4.9 4.9 0 4.9l3.6 3.4L2.7 13 7 10.8 11.3 13l-0.8-4.7L14 4.9 9.1 4.9zM10.2 " +
               "11.6L7 10l-3.2 1.7 0.6-3.6L1.9 5.7l3.5 0L7 1.9l1.6 3.8 3.5 0L9.6 8.1 10.2 11.6z' fill='#C6C6C6'/&gt;&lt;/svg&gt;" +//end upstar.svg
               "&lt;/div&gt;";
    }
    else {
        return "&lt;div class='star vote' &gt;" +
               "&lt;svg xmlns='http://www.w3.org/2000/svg' width='14' height='13' viewBox='0 0 14 13'&gt;" +//start star.svg
               "&lt;polygon points='8.6 5.7 7 1.9 5.4 5.7 1.9 5.7 4.4 8.1 3.8 11.6 7 10 10.2 11.6 9.6 8.1 12.1 5.7 ' fill='#FFF'/&gt;" +
               "&lt;path d='M9.1 4.9L7 0 4.9 4.9 0 4.9l3.6 3.4L2.7 13 7 10.8 11.3 13l-0.8-4.7L14 4.9 9.1 4.9zM10.2 " +
               "11.6L7 10l-3.2 1.7 0.6-3.6L1.9 5.7l3.5 0L7 1.9l1.6 3.8 3.5 0L9.6 8.1 10.2 11.6z' fill='#C6C6C6'/&gt;&lt;/svg&gt;" +//end star.svg
               "&lt;svg class='svghide' xmlns='http://www.w3.org/2000/svg' width='14' height='13' viewBox='0 0 14 13'&gt;" +//start upstar.svg
               "&lt;polygon points='8.6 5.7 7 1.9 5.4 5.7 1.9 5.7 4.4 8.1 3.8 11.6 7 10 10.2 11.6 9.6 8.1 12.1 5.7 ' fill='#FED675'/&gt;" +
               "&lt;path d='M9.1 4.9L7 0 4.9 4.9 0 4.9l3.6 3.4L2.7 13 7 10.8 11.3 13l-0.8-4.7L14 4.9 9.1 4.9zM10.2 " +
               "11.6L7 10l-3.2 1.7 0.6-3.6L1.9 5.7l3.5 0L7 1.9l1.6 3.8 3.5 0L9.6 8.1 10.2 11.6z' fill='#C6C6C6'/&gt;&lt;/svg&gt;" +//end upstar.svg
               "&lt;/div&gt;";
    }
}

function box(likes) {
    if (likes == false) {
        return "&lt;div class='box vote' &gt;" +
               "&lt;svg class='svghide' xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 13 13'&gt;" +//start box.svg
               "&lt;rect x='1' y='1' width='11' height='11' fill='#FFF'/&gt;" +
               "&lt;path d='M0 13h13V0H0V13zM1 1h11v11H1V1z' fill='#C6C6C5'/&gt;&lt;/svg&gt;" +//end box.svg
               "&lt;svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 13 13'&gt;&lt;rect x='1' " +//start downbox.svg
               "y='1' width='11' height='11' fill='#FFF'/&gt;&lt;path d='M0 13h13V0H0V13zM1 1h11v11H1V1z' fill='#C6C6C5'/&gt;" +
               "&lt;path d='M13 0.7c0 0 0 0 0 0 -0.7 0.4-1.4 0.9-2.1 1.4C8.9 3.6 7.1 5.3 5.4 7.2 4.5 6.4 3.5 5.7 2.5 4.9 " +
               "2.1 5.2 1.6 5.6 1.2 5.9c1.7 1.7 3.4 3.4 5.1 5.2 0.5-1.2 1.2-2.4 1.9-3.5 0.8-1.3 1.7-2.5 2.6-3.6C11.5 3.2 12.2 2.4 13 1.7V0.7z' fill='#66665F'/&gt;&lt;/svg&gt;" +//end downbox.svg
               "&lt;/div&gt;";
    }
    else {
        return "&lt;div class='box vote' &gt;" +
               "&lt;svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 13 13'&gt;" +//start box.svg
               "&lt;rect x='1' y='1' width='11' height='11' fill='#FFF'/&gt;" +
               "&lt;path d='M0 13h13V0H0V13zM1 1h11v11H1V1z' fill='#C6C6C5'/&gt;&lt;/svg&gt;" +//end box.svg
               "&lt;svg class='svghide' xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 13 13'&gt;&lt;rect x='1' " +//start downbox.svg
               "y='1' width='11' height='11' fill='#FFF'/&gt;&lt;path d='M0 13h13V0H0V13zM1 1h11v11H1V1z' fill='#C6C6C5'/&gt;" +
               "&lt;path d='M13 0.7c0 0 0 0 0 0 -0.7 0.4-1.4 0.9-2.1 1.4C8.9 3.6 7.1 5.3 5.4 7.2 4.5 6.4 3.5 5.7 2.5 4.9 " +
               "2.1 5.2 1.6 5.6 1.2 5.9c1.7 1.7 3.4 3.4 5.1 5.2 0.5-1.2 1.2-2.4 1.9-3.5 0.8-1.3 1.7-2.5 2.6-3.6C11.5 3.2 12.2 2.4 13 1.7V0.7z' fill='#66665F'/&gt;&lt;/svg&gt;" +//end downbox.svg
               "&lt;/div&gt;";
    }
}

function vote(div) {
    var token = localStorage.token;
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
		        //star
		        div.children("svg").eq(0).removeClass("svghide");
		        div.children("svg").eq(1).addClass("svghide");
	            div.parent().attr("data-dir", "null");
	        }
	        if (dir == 1) {
		        //upstar
		        div.children("svg").eq(1).removeClass("svghide");
		        div.children("svg").eq(0).addClass("svghide");
	            //box
		        div.siblings(".box").children("svg").eq(0).removeClass("svghide");
		        div.siblings(".box").children("svg").eq(1).addClass("svghide");		        
	            div.parent().attr("data-dir", "true");
	        }
	        break;
	    case "box vote":
	        if (dir == 0) {
		        //box
		        div.children("svg").eq(0).removeClass("svghide");
		        div.children("svg").eq(1).addClass("svghide");		        
	            div.parent().attr("data-dir", "null");
	        }
	        if (dir == -1) {
		        //downbox
		        div.children("svg").eq(1).removeClass("svghide");
		        div.children("svg").eq(0).addClass("svghide");
	            //star
		        div.siblings(".star").children("svg").eq(0).removeClass("svghide");
		        div.siblings(".star").children("svg").eq(1).addClass("svghide");
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

$(document).on("click", "#top-logo svg", function() {
	frontPage();
});

$(document).on("click", "#inbox", function() {
	frontPage();
});

function frontPage() {
	var token = localStorage.token;
	if (!token) {
        sessionStorage.subreddit = "/r/all.json?limit=50";
	} else {
        sessionStorage.subreddit = "/.json?limit=50";	
	}
    $('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	$('#mid-box-lft').removeClass('before-lft');
}

$(document).on("click", "svg#top-profile", function() {
    var token = localStorage.token;
    if (!token) {
        var random_str = randStr();
        sessionStorage.state = random_str;
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

$(document).on("click", "svg#top-apps", function() {
    var NSFW = localStorage.nsfw;
    if (NSFW == "true") {
        localStorage.nsfw = "false";
    } else {
        localStorage.nsfw = "true";
    }
    checkAuth();
 });

//log out function
$(document).on("click", "#mid-box-gear", function() {
	localStorage.removeItem("token");
	
    document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "refresh" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "NSFW" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // fix this with tool tips!! $("svg#top-profile").attr("title", "Log In");    
    var endpoint = sessionStorage.subreddit;
    endpoint = endpoint.split("&after=");
    endpoint = endpoint[0];
    sessionStorage.subreddit = endpoint;
    window.location.assign(redirect_uri);
});

$(document).on("click", ".imprtnt", function(event) {
    console.log("Open iFrame");
});

$(document).on("click", ".mail-title", function(event) {
    var set_sub = "/r/" + $(this).text();
    set_sub += ".json?limit=50";
    sessionStorage.subreddit = set_sub;
    checkAuth();
});

$(document).on("click", ".tab", function() {
    var tabID = $(this).attr("id");
    tabID = tabID.replace("tab-", "");
    var endpoint = sessionStorage.subreddit;
	//console.log(endpoint);
    var tab = endpoint.split(".json?limit=50");
    var tabSplit = tab[0].split("/");
    var tabLen = tabSplit.length;
    //console.log(tabSplit);
    var tab_ID = tabSplit[tabLen - 1];
    if (tab_ID != "top" && tab_ID != "new") { tab_ID = "hot"} 
    if (tabLen == 2) { //logged in front page
	    endpoint = "/" + tabID + ".json?limit=50"; 
    }
    if (tabLen >= 3) {
	    endpoint = "/r/" + tabSplit[2] + "/" + tabID + ".json?limit=50";
    }
    $('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	$('#mid-box-lft').removeClass('before-lft').addClass('before-lft');
    sessionStorage.subreddit = endpoint;
    checkAuth();
});

$(document).on("click", "#refresh", function() {
    var endpoint = sessionStorage.subreddit;
    endpoint = endpoint.split("&after=");
    endpoint = endpoint[0];
    sessionStorage.subreddit = endpoint;
    $('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	$('#mid-box-lft').addClass('before-lft');
    checkAuth();
});

$(function() {
    $("#mid-box-rgt").click(function(){
        var endpoint = sessionStorage.subreddit;
        var after = getCookie("after");        
        var count = parseInt(getCookie("count"));
        count += 50;
        if (count === 50) {
	        $('#before-arw').removeClass('before-arw').addClass('before-arw-prev');
	        $('#mid-box-lft').removeClass('before-lft');
        }
        setCookie("count",  count);
        if (endpoint.includes("&before=")) {
	         endpoint = endpoint.split("&before=");    
        } else {
	        endpoint = endpoint.split("&after=");    
        }
        endpoint = endpoint[0] + "&after=" + after + "&count=" + count;
        sessionStorage.subreddit = endpoint;
        checkAuth();
    });
});

$(function() {
    $("#mid-box-lft").click(function(){
	    if ($(this).hasClass("before-lft")) {
		    return;
	    }
        var endpoint = sessionStorage.subreddit;
        var count = parseInt(getCookie("count"));
        if (endpoint.includes("&before=")) {
	         endpoint = endpoint.split("&before=");    
        } else {
	        endpoint = endpoint.split("&after=");    
        }
	    if (count > 50) {
	        count -= 50;
	        setCookie("count",  count);
	        var before = getCookie("before");
            before = "&before=" + before;
            endpoint = endpoint[0] + before + "&count=" + count;
        } else {
	        endpoint = endpoint[0];
	        $('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	        $('#mid-box-lft').addClass('before-lft');
        }
        sessionStorage.subreddit = endpoint;
        checkAuth();
    });
});

$(function() {
    $("input.search").focus(function(){
        if (!$("input.search").val()) {
            $("input.search").val("/r/");
        }
    });

    $("input.search").focusout(function() {
	    if ($("input.search").val() == "/r/") {
            $("input.search").val("");	    
	    }
    })
});

$(function(){
    $(".srchbar").keypress(function (e) {
        var space = (e.keyCode == 32);
        var enter = (e.keyCode == 13);
        if (space || enter) {
            subSearch();
        }
    });
});

$(function() {
    $("#top-magnify").click(function(){
        subSearch();
    });
});

function subSearch() {
    var sub_search = $("input.search").val();
    if (sub_search && sub_search != "/r/") {
        if ($("input.search").is(":focus")) {
            $("input.search").val("/r/");
        } else {
            $("input.search").val(""); 
        }
        sessionStorage.subreddit = sub_search + ".json?limit=50";
        checkAuth();   	    
    }
}


// remove test functions
$(document).on("click", "#delCookies", function(event) {
	sessionStorage.removeItem("state");
	sessionStorage.removeItem("subreddit");
	localStorage.removeItem("nsfw");
	
    document.cookie = "state" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "refresh" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "subreddit" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "after" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "before" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = "count" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Reset Cookies');
});

$(document).on("click", "#testRefresh", function(event) {
  localStorage.token = "blarb";
  console.log('set test cookies');
});
// end remove test functions
