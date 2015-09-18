//This funcion sets a cookie with a name (cname) a value (value) and an experation date (exdate)
function setCookie(cname, cvalue, exdate){
    //console.log("cookie " + cname + " value: " + cvalue);
    var d = new Date();
    d.setTime(d.getTime() + (exdate*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;

}

//This function gets the value of a cookie.
function getCookie(cookiename){

    var name = cookiename + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";

}

// Checks if the cookies are enabled in the browser.
function checkCookiesEnables(){

    if(!navigator.cookieEnabled){
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|NokiaBrowser/i.test(navigator.userAgent) ) {
            window.location.href = "nocookiesenabled.html";
        }else{
            window.location.href = "nocookiesenabled.html";
        }
    }
}

//This function can be called when they understad the cookies, this cookie can be checked later on.
function understandcookies(){

    setCookie("understandcookie", "true", "infinite");
    $('#cookieinfo').slideUp();
}