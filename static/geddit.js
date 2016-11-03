"use strict";
var redirect_uri = "https://pydevcs.github.io/geddit/";
var client_id = "7NeqizMXmEZFKA";
var refresh = false;

window.onpopstate = function(event) {
  //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
  var back = document.location;
  back.replace("/geddit", "");
  console.log("Back: " + back);
  //checkAuth(back);
};

//routing function
(function(){
  if (typeof localStorage === 'object') {
      try {
          localStorage.setItem('localStorage', 1);
          localStorage.removeItem('localStorage');
      } catch (e) {
          Storage.prototype._setItem = Storage.prototype.setItem;
          Storage.prototype.setItem = function() {};
          alert("This site uses LocalStorage and cannot be used in Safari Private Browsing Mode. Try Chrome! ;]");
          return;
      }
  }
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  refresh = true;
  var endpoint = "/";
  if (redirect && redirect != location.href) {
      history.replaceState(null, null, redirect);
      var path = window.location.pathname;
      path = path.split("/");
      var paths = ["r", "hot", "new", "top"];
      if (path.length >= 3) {
          if (typeof path[2] !== 'undefined') {
              var r = paths.indexOf(path[2].toLowerCase());
              if (r > -1) {
                  if (r === 0) {
                      if (path.length >= 4) {
	                      endpoint += "r/" + path[3];
                      } else {
	                      alert("That page does not exist");
                      }
                  } else {
                      endpoint += paths[r];
                  }
              } else {
                  alert("That page does not exist");
              }
          }	    
      }
      if (path.length >= 5) {
          if (typeof path[4] !== 'undefined') {
              paths[0] = "comments";
              var modifier = paths.indexOf(path[4].toLowerCase());
            
              if (modifier > -1) {
                  if (modifier === 0) {
                      if (path.length >= 6) {
	                      endpoint += "/comments/" + path[5];
	                      $("div#main-list").hide();
		                  $("div#btm").hide();
		                  $("div#contain").show();
                      } else {
	                      alert("That page does not exist");
                      }                    
                  } else {
                      endpoint += "/" + paths[modifier];
                  }
              } else {
                  alert("That page does not exist");
              }            
          }
      }
  }
  endpoint += ".json?limit=50";
  checkAuth(endpoint);
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


function getToken(code, endpoint) {
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
      localStorage.token = auth_resp.access_token;
      localStorage.refresh = auth_resp.refresh_token;
      window.location.assign(redirect_uri);
    }).fail(function() {
      console.log("Access Token Error");
    });
}

function refresh(voteObj, endpoint) {
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
	      geddit(token, endpoint);	      
      } else {
	      vote(voteObj);
      }
    })
    .fail(function() {
      console.log("Error Refreshing Token");
    });
}

function checkAuth(endpoint) {
    var token = localStorage.token;
    if (token) {
        if (refresh) {
            refresh = false;
	        profile(token);    
        }
        geddit(token, endpoint);
    }
    else {
        if (document.location.search.length) { // query string exists
            var code = getUrlParameter("code");
            var state = getUrlParameter("state");
            if (code != "") {
                if (state == sessionStorage.state) {
                    getToken(code, endpoint);
                }
                else {
                    console.log("State string does not match!");
                }
            }
            return;
        }
        geddit(undefined, endpoint);
    }
}

function geddit(token, endpoint){
    var back = "/geddit" + endpoint.replace(".json?limit=50", "");
    history.pushState(null, null, back);
    var url;
    if (token === undefined || token == "undefined") {
	    url = "https://www.reddit.com";
    } else {
	    url = "https://oauth.reddit.com";
    }
    console.log(endpoint);
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
            refresh(false, endpoint);   
        }
        else {
        console.log("geddit Error");
        console.log(errorThrown);
        }
    });
}

function profile(token) {
    var promise = $.ajax({
      url: "https://oauth.reddit.com/api/v1/me",
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
      },
      type: "GET",
      dataType: "json"
    })
    .done(function(json_data) {
         document.getElementById("username").innerHTML = json_data.name;
         if (json_data.has_mail) {
             document.getElementById("has-mail").style.fill = "D9453D";
             document.getElementById("inbox-count").innerHTML = " (" + json_data.inbox_count + ")";
         }
    })
    .fail(function( jqXHR, textStatus, errorThrown) {
        console.log("Profile Error");
    });
}

function renderContent(json, endpoint) {
	if (!$("div#contain").is(":visible") ) {
		$("div#contain").hide();
		$("div#btm").show();
		$("div#main-list").show();
	}
    //console.log(json.data);
    var after = json.data.after;
	sessionStorage.after = after;
	var before = json.data.before;
	sessionStorage.before = before;
	sessionStorage.endpoint = endpoint;
	if (before != null) {
		console.log("Before " + before);
	} else {
		sessionStorage.count = 0;
		$('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	    $('#mid-box-lft').removeClass('before-lft').addClass('before-lft');
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
      refresh(div, "");
    });
}

$(document).on("click", ".vote", function() {
    vote($(this));
});

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


$(document).on("click", "svg#top-notify", function() {
    console.log("Read Inbox");
});

$(document).on("click", "div#inbox", function() {
    console.log("Read Inbox");
});

$(document).on("click", "svg#top-apps", function() {
    var NSFW = localStorage.nsfw;
    if (NSFW == "true") {
        localStorage.nsfw = "false";
    } else {
        localStorage.nsfw = "true";
    }
    checkAuth(sessionStorage.endpoint);
 });

//log out function
$(document).on("click", "#mid-box-gear", function() {
	localStorage.removeItem("token");
	localStorage.removeItem("refresh");
	
    // fix this with tool tips!! $("svg#top-profile").attr("title", "Log In");
    
    //refactor
    //var endpoint = sessionStorage.subreddit;
    //endpoint = endpoint.split("&after=");
    //endpoint = endpoint[0];
    //sessionStorage.subreddit = endpoint;
    //end refactor
    
    window.location.assign(redirect_uri);
});

$(document).on("click", ".imprtnt", function(event) {
    console.log("Open iFrame");
});

$(document).on("click", ".mail-title", function(event) {
    var endpoint = "/r/" + $(this).text();
    endpoint += ".json?limit=50";
    checkAuth(endpoint);
});

$(document).on("click", ".tab", function() {
    var tabID = $(this).attr("id");
    tabID = tabID.replace("tab-", "");
    var endpoint = sessionStorage.endpoint;
    var tab = endpoint.split(".json?limit=50");
    var tabSplit = tab[0].split("/");
    var tabLen = tabSplit.length;
    var tab_ID = tabSplit[tabLen - 1];
    if (tab_ID != "top" && tab_ID != "new") { tab_ID = "hot"} 
    if (tabLen == 2) {
	    endpoint = "/" + tabID; 
    }
    if (tabLen >= 3) {
	    endpoint = "/r/" + tabSplit[2] + "/" + tabID;
    }
    endpoint += ".json?limit=50";
    checkAuth(endpoint);
});

$(document).on("click", "#refresh", function() {
    $('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	$('#mid-box-lft').addClass('before-lft');

    var path = window.location.pathname;
    var endpoint;
    path = path.split("/");
    if (path.length == 3) {
        endpoint = "/";
    } else {
        if (path[2] == "r") {
	        endpoint = "/r/" + path[3];
        }
        if (path.length > 5 && path[5] != "") {
            console.log("Pathname is too long, 404 message");
        }
        if (path.length == 5) {
	        endpoint += "/" + path[4];
        }	    
    }
    endpoint += ".json?limit=50";
    checkAuth(endpoint);
});

$(function() {
    $("#mid-box-rgt").click(function(){
        var endpoint = sessionStorage.endpoint;
        var after = sessionStorage.after;      
        var count = parseInt(sessionStorage.count);
        count += 50;
        sessionStorage.count =  count;
        if (count === 50) {
	        $('#before-arw').removeClass('before-arw').addClass('before-arw-prev');
	        $('#mid-box-lft').removeClass('before-lft');
        }
        if (endpoint.includes("&before=")) {
	         endpoint = endpoint.split("&before=");    
        } else {
	        endpoint = endpoint.split("&after=");    
        }
        endpoint = endpoint[0] + "&after=" + after + "&count=" + count;
        checkAuth(endpoint);
    });
});

$(function() {
    $("#mid-box-lft").click(function(){
	    if ($(this).hasClass("before-lft")) {
		    return;
	    }
        var endpoint = sessionStorage.endpoint;
        if (endpoint.includes("&before=")) {
	         endpoint = endpoint.split("&before=");    
        } else {
	        endpoint = endpoint.split("&after=");    
        }
        var count = parseInt(sessionStorage.count);
	    if (count <= 50) {
	        endpoint = endpoint[0];
	        //$('#before-arw').removeClass('before-arw-prev').addClass('before-arw');
	        //$('#mid-box-lft').addClass('before-lft');
        } else {
	        var before = sessionStorage.before;
            before = "&before=" + before;
            count -= 50;
            endpoint = endpoint[0] + before + "&count=" + count;
            sessionStorage.count = count;
        }
        checkAuth(endpoint);
    });
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
    console.log(sub_search);
}


// remove test functions
$(document).on("click", "#delCookies", function(event) {
	sessionStorage.removeItem("state");
	sessionStorage.removeItem("subreddit");
	localStorage.removeItem("nsfw");
	localStorage.removeItem("token");
	
    //document.cookie = "state" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //document.cookie = "refresh" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //document.cookie = "subreddit" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //document.cookie = "after" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //document.cookie = "before" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //document.cookie = "count" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Reset Local Storage Data');
});

$(document).on("click", "#testRefresh", function(event) {
  localStorage.token = "blarb";
  console.log('set test token');
});
// end remove test functions
