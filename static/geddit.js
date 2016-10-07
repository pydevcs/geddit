"use strict";
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
    var data;
    if (code == "refresh") {
        code = getCookie("refresh");
        data = {
            "grant_type": "refresh_token",
            "refresh_token" : code,
            "redirect_uri": redirect_uri
        };
    }
    else {
        data = {
            "grant_type": "authorization_code",
            "code" : code,
            "redirect_uri": redirect_uri
        };
    }
    var promise = $.ajax({
      url: endpoint,
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":"));
      },
      type: "POST",
      dataType: "json"
    });
    
	promise.done(function(auth_resp) {
      var token = auth_resp.access_token;
      setCookie("token", token);
      console.log("Token " + token);
      var refresh_token = auth_resp.refresh_token;
      if (refresh_token  !== undefined) {
          setCookie("refresh", refresh_token);
      }
	});
	
	promise.fail(function() {
	  console.log("Access Token Error");
	});
}

function getAuth() {
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
    else {
        console.log("Access Code Error!");
    }
}

function checkAuth(permalink, after) {
    var token=getCookie("token");
    permalink += ".json?limit=50";
    if (after) {
        after = $("#mid-box-rgt").data("after");
	    permalink += "&after=" + after;
    }
    if (token != "") {
        //geddit(token, "subreddits", "/subreddits/mine/subscriber?limit=100"); //subreddits
        //geddit(token, "name", "/api/v1/me"); //username
        //geddit(token, 'front', "/?limit=50"); //front page
        $("#mid-box-rgt").data( "subreddit", permalink );
        geddit(token, permalink);

    }
    else {
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

function geddit(token, endpoint){
    var promise = $.ajax({
      url: "https://oauth.reddit.com" + endpoint,
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
      },
      type: "GET",
      dataType: "json"
    });
    
	promise.done(function(json_data) {
	  renderContent(json_data);
	});
	
	promise.fail(function(endpoint) {
	  console.log("Token Expired")
	  refresh(endpoint);
	});
}

function refresh(endpoint) {
    var code = getCookie("refresh");
    var data = {
        "grant_type": "refresh_token",
        "refresh_token" : code,
        "redirect_uri": redirect_uri
    };
    var promise = $.ajax({
      url: endpoint,
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":"));
      },
      type: "POST",
      dataType: "json"
    });
    
	promise.done(function(auth_resp) {
      var token = auth_resp.access_token;
      setCookie("token", token);
      console.log("Token " + token);
	})
	.then(function() {
	  geddit(endpoint);
	});

	
	promise.fail(function() {
	  console.log("Error Refreshing Token");
	});

}

function renderContent(json) {
    console.log(json.data);
    var after = json.data.after;
    $("#mid-box-rgt").data( "after", after );
    var main_list = "";
    $.each(json.data.children, function (i, ob) {
        //var timeAgo = moment.unix(ob.data.created_utc).fromNow(false);   //false includes "ago"
        var postdate = moment.unix(ob.data.created_utc).format("MMM D");
        var post = "&lt;div class='mail-item' data-id='" + ob.data.name + "' data-dir='" + ob.data.likes + "'&gt;" +
        "&lt;img class='box vote' src='" + box(ob.data.likes) + "' width='14px' height='14px'&gt;" +
        "&lt;img class='star vote' src='" + star(ob.data.likes) + "' width='14px' height='13px'&gt;" +
        "&lt;img class='imprtnt' src='static/img/imprtnt.svg' width='14px' height='11px'&gt;" +
        "&lt;a class='mail-title' href='https://www.reddit.com" +
        ob.data.permalink  + "'&gt;" +
        ob.data.subreddit + "&lt;/a&gt;&lt;div class='mail-info'&gt;&lt;a href='" + ob.data.url + "'&gt;" +
        ob.data.title + "&lt;/a&gt;&lt;/div&gt;&lt;div class='mail-date'&gt;" +
        postdate + "&lt;/div&gt;&lt;/div&gt;";
        var rendered_link = $("<div />").html(post).text();
        main_list += rendered_link;
    });
    $("#main-list").html(main_list);
    $("#content").scrollTop(0);
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

$(document).on("click", ".vote", function() {
    var token=getCookie("token");
    var data_id = $(this).parent().attr("data-id");
    var dir = $(this).parent().attr("data-dir");
    var cls = $(this).attr("class");
    switch(cls) {
    case "star vote":
        if (dir == "true") {
            dir = 0;
            $(this).attr("src","static/img/star.svg");
            $(this).parent().attr("data-dir", "null");
        }
        if (dir == "null" || dir == "false") {
            dir = 1;
            $(this).attr("src","static/img/upstar.svg");
            $(this).siblings(".box").attr("src","static/img/box.svg");
            $(this).parent().attr("data-dir", "true");
        }
        break;
    case "box vote":
        if (dir == "false") {
            dir = 0;
            $(this).attr("src","static/img/box.svg");
            $(this).parent().attr("data-dir", "null");
        }
        if (dir == "null" || dir == "true") {
            dir = -1;
            $(this).attr("src","static/img/downbox.svg");
            $(this).siblings(".star").attr("src","static/img/star.svg");
            $(this).parent().attr("data-dir", "false");
        }
        break;
    }
    $.ajax({
      url: "https://oauth.reddit.com/api/vote",
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "bearer " + token);
      },
      type: "POST",
      data: { id: data_id, dir: dir },
      dataType: "json",
      error: function(error, textStatus, xhr) {
          console.log("Voting Error");
      }
    });
});


$(document).on("click", ".mail-date", function(event) {
    console.log($(this).attr("class"));
});

$(document).on("click", ".tab", function() {
    $(".tab").removeClass("active");
    $(this).addClass("active");
    var current_sub = $("#mid-box-rgt").data( "subreddit");
});

$(document).on("click", "#refresh", function() {
    var sub_search = $("#mid-box-rgt").data( "subreddit");
    checkAuth(sub_search, false);
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
        var subreddit = $("#mid-box-rgt").data("subreddit");
        checkAuth(subreddit, true);
    });
});

$(function() {
    $("#top-magnify").click(function(){
        var sub_search = $("input.search").val();
        $("#mid-box-rgt").data( "subreddit", sub_search );
        checkAuth(sub_search, false);
    });
});

$(function(){
    $(".srchbar").keypress(function (e) {
        var space = (e.keyCode == 32);
        var enter = (e.keyCode == 13);
        if (space || enter) {
            var sub_search = $("input.search").val();
            $("#mid-box-rgt").data( "subreddit", sub_search );
            checkAuth(sub_search, false);
        }
    });
});
