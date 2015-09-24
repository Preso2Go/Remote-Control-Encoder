$(document).ready(function(){
    /*Gets rid of any errors*/
    $("#errorfield").empty();
    $("#login").remove();

    if(getCookie("understandcookie") == "true") $('#cookieinfo').remove();

    initializeloginevents();
    checkCookiesEnables();
});

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
            console.log(j);
            if(j['errorMessage'] == "Invalid credential."){
                $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
            }
            else{
                setCookie("sessionId",j['sessionId'],0.3);
                setCookie("password", password);
                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|NokiaBrowser/i.test(navigator.userAgent) ) window.location.href = "./mobile_remotecontroller.html";
                else window.location.href = "./remote_controller.html";

            }
        },
        error: function(errorThrown) {
            $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
        }
    });
}
