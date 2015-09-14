$(document).ready(function(){
    //Gets rid of any errors
    $("#errorfield").empty();

    if(getCookie("understandcookie") == "true") $('#cookieinfo').remove();

    initializeloginevents();
    checkCookiesEnables();
});

function checkValidLogin(givenip, givenpass){
    //TODO: change this
    var ip = ""; var password = "";
    if(givenip != null && givenpass != null){
        ip = givenip;
        password = givenpass;
    }else{
        ip = encodeURIComponent($('#ipform').val());
        password = encodeURIComponent($('#passwordform').val());
    }
    var Url = "http://" + ip + "?action=sendcommand&actiondetail=initializeremotecontrol&user=presentations2go&password=" + password;
    $.ajax({

        url: Url,
        type: "POST",
        dataType: "jsonp",
        async: false,

        success: function(json){
            setCookie("ip", ip);
            setCookie("password", password);
            var j = $.parseJSON(json);
            setCookie("sessionId",j['sessionId'],0.3);
            window.location.href = "./remote_controller.html";
        },
        error: function(errorThrown) {
            $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
        }
    });

}
