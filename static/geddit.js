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
    });

    promise.done(function(auth_resp) {
      var token = auth_resp.access_token;
      setCookie("token", token);
      console.log("Token " + token);
      var refresh_token = auth_resp.refresh_token;
      setCookie("refresh", refresh_token);
    });

    promise.fail(function() {
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
    });

    promise.done(function(auth_resp) {
      var token = auth_resp.access_token;
      setCookie("token", token);
      console.log("Token " + token);
      geddit(token, endpoint);
    });

    promise.fail(function() {
      console.log("Error Refreshing Token");
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

function checkAuth(permalink) {
    var token=getCookie("token");
    var str_tst = permalink.includes(".json?limit=50");
    if (!str_tst) {
        permalink += ".json?limit=50";
    }
    if (token != "") {
        setCookie("subreddit", permalink);
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
      renderContent(json_data, endpoint);
    });

    promise.fail(function() {
      console.log("Token Expired")
      refresh(endpoint);
    });
}

function renderContent(json, endpoint) {
    console.log(json.data);
    var after = json.data.after;
    var after_removed = endpoint.split("&after=");
    endpoint = after_removed[0] + "&after=" + after;
    setCookie("subreddit", endpoint);
    var main_list = "";
    $.each(json.data.children, function (i, ob) {
        //var timeAgo = moment.unix(ob.data.created_utc).fromNow(false);   //false includes "ago"
        var postdate = moment.unix(ob.data.created_utc).format("MMM D");
        var post = "&lt;div class='mail-item' data-id='" + ob.data.name + "' data-dir='" + ob.data.likes + "'&gt;" +
        "&lt;img class='box vote' src='" + box(ob.data.likes) + "' width='14px' height='14px'&gt;" +
        "&lt;img class='star vote' src='" + star(ob.data.likes) + "' width='14px' height='13px'&gt;" +
        "&lt;img class='imprtnt' src='static/img/imprtnt.svg' width='14px' height='11px'&gt;" +
        "&lt;div class='mail-title' &gt;" +
        ob.data.subreddit + "&lt;/div&gt;&lt;div class='mail-info'&gt;&lt;a href='" + ob.data.url + "'&gt;" +
        ob.data.title + "&lt;/a&gt;&lt;/div&gt;&lt;a class='mail-date' href='https://reddit.com" + ob.data.permalink +"' &gt;" +
        postdate + "&lt;/a&gt;&lt;/div&gt;";
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

function voteTest(div) {
    var token=getCookie("token");
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
    });

    promise.done(function(json_data) {
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
    });

    promise.fail(function() {
      console.log("Voting Error")
      //refresh(endpoint);
    });
}

$(document).on("click", ".vote", function() {
    voteTest($(this));
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
    checkAuth(subreddit);
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
        var subreddit = getCookie("subreddit");
        checkAuth(subreddit);
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