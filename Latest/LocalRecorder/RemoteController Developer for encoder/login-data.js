$(document).ready(function(){
    /*Gets rid of any errors*/
    $("#errorfield").empty();

    /*checks if after the url, there is the ip paramiter given, if so the ip will automatically be filled in, and the user will only have fill in the password.
    * If the ip and password are given, this will be handled in the html page. as one of the first things.
    * So if there is something filled in, the page won't be fully loaded before the user gets redirected!*/
    var urldata = window.location.href.split("?")[1];
    if(urldata != null){
        var userpassraw = urldata.split("&");
        if(userpassraw[0] != null){
            var first = userpassraw[0].split("=");
            if(first[0].toLowerCase() == "ip"){
                $("#ipform").val(first[1]);
            }
        }
    }
    $("#login").remove();

    /*If the user already has clicked the understand cookies button, the cookie info bar will get removed. NOT USED in here.*/
    /*if(getCookie("understandcookie") == "true") $('#cookieinfo').remove();*/

    initializeloginevents();
    checkCookiesEnables();
});

/*Checks if the login credentials are valid. It will try to send a request to the encoder with the login credentials. If it gets an error, the login credentials are not valid.
* givenip: you can give the function an ip with it. If you don't, it will get the ip from the input element.
* givenpass: same as the givenip but than for the password.*/
function checkValidLogin(givenpass){

    var ip = location.host;
    var password;
    if(givenpass != null){
        password = givenpass;
    }else{
        password = encodeURIComponent($('#passwordform').val());
    }
    var Url = "http://" + ip + "?action=sendcommand&actiondetail=initializeremotecontrol&user=presentations2go&password=" + password;
    $.ajax({

        url: Url,
        type: "POST",
        dataType: "jsonp",
        async: false,

        success: function(json){
            var j = $.parseJSON(json);
            if(j['errorMessage'] == "Invalid credential."){
                $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
            }
            else{
                setCookie("sessionId",j['sessionId'],0.3);
                setCookie("ip", ip);
                setCookie("password", password);
                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|NokiaBrowser/i.test(navigator.userAgent) ) window.location.href = "mobile-remote_controller.html";
                else window.location.href = "remote_controller.html";
            }
        },
        error: function(errorThrown) {
            $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
        }
    });
}
