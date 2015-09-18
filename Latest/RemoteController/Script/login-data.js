$(document).ready(function(){
    /*Gets rid of any errors*/
    $("#errorfield").empty();

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

    if(getCookie("understandcookie") == "true") $('#cookieinfo').remove();

    initializeloginevents();
    checkCookiesEnables();
});

function checkValidLogin(givenip, givenpass){

    var ip; var password;
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
            var j = $.parseJSON(json);
            console.log(j);
            if(j['errorMessage'] == "Invalid credential."){
                $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
            }
            else{
                setCookie("sessionId",j['sessionId'],0.3);
                setCookie("ip", ip);
                setCookie("password", password);
                window.location.href = "./remote_controller.html";
            }
        },
        error: function(errorThrown) {
            $("#errorfield").empty().prepend("Whoops, seems like there is something wrong with your login credentials!");
        }
    });
}