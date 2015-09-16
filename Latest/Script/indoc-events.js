/*Everything that can happen in the controller screen.*/
function initializeremotecontrollerevents(){
    window.isrecording = false;
    window.countingdown = false;
    window.currentorgotoscreen = 0;
    window.p2defaultimgvideo = null;
    window.p2defaultimgslide = null;
    window.p3defaultimgvideo = null;
    window.p3defaultimgslide = null;

    if(getCookie("password") == "" || getCookie("password") == null) window.location.href = "./";
    $("#bp1").on("click", function(){
        gotopage1();
    });
    $("#bp2").on("click", function(){
        gotopage2();
    });
    $("#bp3").on("click", function(){
        gotopage3();
    });

    /*Metadata*/
    $("#metatitle").on("input propertychange paste",function(){
        setMetaData('Title',$(this).val(), function(){
            btnPress('updateprojectinfo');
        });
    });
    $("#metadescription").on("input propertychange paste",function(){
        setMetaData('Description',$(this).val(), function(){
            btnPress('updateprojectinfo');
        });
    });
    $("#updatemetadata").on("click",function(){
        updatemetadatetoencoder();
    });

    /*Controls*/
    $("#logout").on("click",function(){
        logout();
    });
    $("#recpausebtn").on("click",function(){
        if(!window.countingdown){
            if(($("#recpausebtn p:first-child").attr("id") == "record" || $("#recpausebtn p:first-child").attr("id") == "resume") && $("#recpausebtn p:first-child").attr("id") != "pause"){
                updatelivecheckbox(function(){
                    if(window.livecheckbox && $("#recpausebtn").attr("class") == "recstatus"){
                        updatemetadatetoencoder(function(){
                            $("#recpausebtn").attr("class", "liverecording").attr("title", "You are live right now");
                            $("#recpausebtn p:first-child").attr("id","pause").empty();
                            window.isrecording = true;
                            setcountdown("live");
                        });
                    }else if(!window.currentlylive){
                        updatemetadatetoencoder(function(){
                            window.isrecording = true;
                            if($("#recpausebtn p:first-child").attr("id") == "resume") btnPress('Startpause');
                            else setcountdown("default");

                            $("#recpausebtn p:first-child").attr("id","pause").empty();
                            $("#recpausebtn").attr("title", "Pause").removeAttr("class");
                        });
                    }else{
                        errormsgcantchangewhilerecording();
                    }
                });
            }
            else if($("#recpausebtn p:first-child").attr("id") == "pause"){
                updatecurrentlylive(function(){
                    if(!window.currentlylive){
                        $("#recpausebtn").attr("title", "Resume");
                        $("#recpausebtn p:first-child").attr("id","resume").append("<p></p>").append("<p></p>");
                        btnPress('Startpause');
                    }else{
                        errormsgcantchangewhilerecording();
                    }
                });
            }
        }else{
            swal({
                title: "Oops..",
                text: "You can't change that inside the delay!",
                type: "error",
                showCancelButton: false,
                timer: 3000,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            });
        }
    });
    $("#stopbtn").on("click",function(){
        btnPress('Stop');
        window.isrecording = false;
        window.currentlylive = false;
        $("#recpausebtn").attr("title", "Record").attr("class", "recstatus");
        $("#recpausebtn p:first-child").attr("id","record").empty();
    });
    $("#capturenowbtn").on("click",function(){
        btnPress('Capturenow');
    });
    $('input, textarea').on('keypress', function (e) {
        if(e.which == 13)  // the enter key code
        {
            $(this).next().next().next().next().focus();
            updatemetadatetoencoder();
        }
    });


    /*Switches*/
    $('input[type=checkbox]').each(function(){
        $(this).on("click",function(){
            var nexttag = $(this).next();
            if($(this).is(":checked")){
                if($(nexttag).attr("title") == "Autopublish"){
                    $(nexttag).attr("class", "activechkbx");
                    setConfiguration("autopublish", "true");
                }else if(window.isrecording == false){
                    $(nexttag).attr("class", "activechkbx");
                    if($(nexttag).attr("title") == "Live") setConfiguration("live", "true");
                    else if($(nexttag).attr("title") == "Presenter Only") setConfiguration("noslide", "true");
                }else{
                    errormsgcantchangewhilerecording();
                }
            }else{
                if($(nexttag).attr("title") == "Autopublish"){
                    $(nexttag).removeAttr("class");
                    setConfiguration("autopublish", "false");
                }else if(window.isrecording == false){
                    $(nexttag).removeAttr("class");
                    if($(nexttag).attr("title") == "Live"){
                        setConfiguration("live", "false");
                    }
                    else if($(nexttag).attr("title") == "Presenter Only") setConfiguration("noslide", "false");
                }else{
                    errormsgcantchangewhilerecording();
                }
            }
        });
    });


    /*MoreSettings*/
    $('.ui-spinner-button').click(function() {
        $(this).siblings('input').change();
    });
    $("#delaynr").on("input propertychange paste", function(){
        checkdelaynr($("#delaynr").val());
    }).change(function(){
        setConfiguration("startdelay", $(this).spinner('value'));
    });

    /*Info field*/
    $('#infofield').on('click', function(){
        $(this).slideUp(1000);
        setCookie("understandwarning","true", "10");
    });

    /*Pages*/
    $(".item1, .item2, .item3").on("mousedown", function(){
        $(this).attr("id", "navmousedown");
    });
    $("html").on("mouseup", function(){
        $(".item1, .item2, .item3").removeAttr("id");
    });

    //TODO: Fix it so when you click the other button the animation does not just finished and goes back, but goes back from that point.
    /* When going to another screen, and that screen has a picture updating automatically,
    * this will initialize the picture updating and remove the updating when the user goes away from that screen.
    * When going from the first to the 3th screen or the other way around, one picure will be loaded on page 2, so that is also updated.
    */
    $(".item1").on('click', function(){
        gotopage1();
    });
    $(".item2").on('click', function(){
        gotopage2();
    });
    $(".item3").on('click', function(){
        gotopage3();
    });

    /*Images on page 2*/
    //TODO: When click on the image, popup screen appears. and the image is shown and updated very fast.
    $("#click1").on('click', function() {
        clearInterval(window.intervalimgclick);
        var password = getCookie("password");
        var ip = getCookie("ip");
        var d = new Date();
        var url = "http://" + ip + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&hour=" + d.getHours() + "&sec=" + d.getSeconds() + "&milisec=" + d.getMilliseconds();
        $("#imgpopupinner img").attr("src", url).attr("id", "imgpopup1");
        $("#imgpopupouter").css("visibility", "visible");
        window.intervalimgclick = setInterval(function () {
            var d = new Date();
            var url = "http://" + ip + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&hour=" + d.getHours() + "&sec=" + d.getSeconds() + "&milisec=" + d.getMilliseconds();
            $("#imgpopupinner img").attr("src", url);
        }, 900);
    });
    $("#click2").on('click', function(){
        clearInterval(window.intervalimgclick);
        var password = getCookie("password");
        var ip = getCookie("ip");
        var d = new Date();
        var url = "http://" + ip + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&hour=" + d.getHours() + "&sec=" + d.getSeconds() + "&milisec=" + d.getMilliseconds();
        $("#imgpopupinner img").attr("src", url).attr("id", "imgpopup2");
        $("#imgpopupouter").css("visibility", "visible");
        window.intervalimgclick = setInterval(function () {
            var d = new Date();
            var url = "http://" + ip + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&hour=" + d.getHours() + "&sec=" + d.getSeconds() + "&milisec=" + d.getMilliseconds();
            $("#imgpopupinner img").attr("src", url);
        }, 900);
    });
    $("#closeimgbtn").on("click", function(){
        stopandhidepopoutimgp2();
    });
    $('html').on('keypress', function (e) {
        if(e.which == 27)  /* the esc key code*/
        {
            stopandhidepopoutimgp2();
        }
    });

    /*The delay nr buttons on mobile*/
    $("#min").on("click", function(){
        var nr = parseInt($("#delaynr").val());
        if(nr > 0){
            $("#delaynr").val(nr -= 1);
            checkdelaynr($("#delaynr").val());
        }
    });
    $("#plus").on("click", function(){
        var nr = parseInt($("#delaynr").val());
        if(nr < 1000){
            $("#delaynr").val(nr += 1);
            checkdelaynr($("#delaynr").val());
        }
    });

    /*Events for remotecontroller on mobile*/
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|NokiaBrowser/i.test(navigator.userAgent) ) {
        /* currentgotoscreen:
         * 0: Metadata
         * 1: Video and sound
         * 2: Camera Controls
         */
        /* When going to another screen, and that screen has a picture updating automatically, this will initialize the picture updating and remove the updating when the user goes away from that screen.*/
        $("#maincontainer").on("swipeleft", function(){
            var swipeleftfunction;
            if($("#info").css("left") != "-1400px" && window.currentorgotoscreen < 2){
                window.currentorgotoscreen += 1;
                stopandhidepopoutimgp2();
                console.log(window.currentorgotoscreen);
                if(window.currentorgotoscreen == 1){
                    //window.p2defaultimgvideo = initializeimagevent(".VideoSource", 4000);
                    ////window.p2defaultimgslide = initializeimagevent(".SlideSource", 5000);
                    swipeleftfunction = function(){};
                    gotopage2("mobile");
                }else if(window.currentorgotoscreen == 2){
                    //window.p3defaultimgvideo = initializeimagevent(".VideoSourcep3", 500);
                    //window.p3defaultimgslide = initializeimagevent(".SlideSourcep3", 2000);
                    swipeleftfunction = function(){
                        clearInterval(window.p2defaultimgvideo);
                        clearInterval(window.p2defaultimgslide);
                    };
                    gotopage3("mobile");
                }
                $("#page3, #page2, #info").animate({
                    left: "-=900px"
                }, 700, swipeleftfunction());
            }
        }).on("swiperight", function(){
            var swiperightfunction;
            if($("#info").css("left") != "0px" && window.currentorgotoscreen > 0){
                window.currentorgotoscreen -= 1;
                console.log(window.currentorgotoscreen);
                stopandhidepopoutimgp2();
                if(window.currentorgotoscreen == 1){
                    //window.p2defaultimgvideo = initializeimagevent(".VideoSource", 4000);
                    ////window.p2defaultimgslide = initializeimagevent(".SlideSource", 5000);
                    swiperightfunction = function(){
                        clearInterval(window.p3defaultimgvideo);
                        clearInterval(window.p3defaultimgslide);
                    };
                    gotopage2("mobile");
                }else if(window.currentorgotoscreen == 0){
                    swiperightfunction = function(){
                        clearInterval(window.p3defaultimgvideo);
                        clearInterval(window.p3defaultimgslide);
                        clearInterval(window.p2defaultimgvideo);
                        clearInterval(window.p2defaultimgslide);
                    };
                    gotopage1("mobile");
                }
                $("#page3, #page2, #info").animate({
                    left: "+=900px"
                }, 700, swiperightfunction());
            }
        }).on("swipe", function(){
            stopandhidepopoutimgp2();
        });
        $("#click1").on('click', function() {
            $("#closeimgbtn").css("visibility", "visible");
        });
        $("#click2").on('click', function(){
            $("#closeimgbtn").css("visibility", "visible");
        });
        var slider = $("#slider").slider({
            animation: true,
            value: 0,
            stop: function( event, ui ) {}
        }).on("slidestop", function( event, ui ){
            setConfiguration("mastervolume",ui.value);
        });

        $("#leftimg, #rightimg").on("click", function(){
            if($("#rightimg").css("z-index") == "1") $("#rightimg").css("z-index", "-1");
            else if($("#rightimg").css("z-index") == "-1") $("#rightimg").css("z-index", "1");
        });

    /*Events for remotecontroller on desktop*/
    }else{
        var slider = $("#slider").slider({
            animation: true,
            value: 0,
            stop: function( event, ui ) {}
        }).on("slidestop", function( event, ui ){
            setConfiguration("mastervolume",ui.value);
        });

        var spin = $("#delaynr").spinner({
            min: 0,
            max: 1000,
            spin:  function(event, ui){checkdelaynr(ui.value)}
        });
        $("#imgpopupouter, #closeimgbtn").on("mouseover", function(){
            if($("#imgpopupouter").css("visibility") != "hidden" && $("#closeimgbtn").css("visibility") == "hidden"){
                $("#closeimgbtn").css("visibility", "visible");
            }
        }).on("mouseout", function(){
            if($("#imgpopupouter").css("visibility") != "hidden" && $("#closeimgbtn").css("visibility") == "visible"){
                $("#closeimgbtn").css("visibility", "hidden");
            }
        });
    }

    /*Page 3 Camera Control!*/
    $("#zoomi").on('mousedown', function() { usecamera("camerazoomin") });
    $("#zoomo").on('mousedown', function() { usecamera("camerazoomout") });

    $("#op1").on('mousedown', function() { usecamera("cameramoveleftup") });
    $("#op2").on('mousedown', function() { usecamera("cameramoveup") });
    $("#op3").on('mousedown', function() { usecamera("cameramoverightup") });
    $("#op4").on('mousedown', function() { usecamera("cameramoveleft") });

    $("#opHome").on('mousedown', function() { usecamera("cameramovehome") });

    $("#op5").on('mousedown', function() { usecamera("cameramoveright") });
    $("#op6").on('mousedown', function() { usecamera("cameramoveleftdown") });
    $("#op7").on('mousedown', function() { usecamera("cameramovedown") });
    $("#op8").on('mousedown', function() { usecamera("cameramoverightdown") });


}

/*Everything that can happen in the login screen.*/
function initializeloginevents(){
    $('input').on('keypress', function (e) {
        if(e.which == 13)  /* the enter key code*/
        {
            checkValidLogin();
        }
    });

    $("#Agreebtn").on("click", function(){
        understandcookies();
    });
    $("#loginbutton").on("click",function(){
        checkValidLogin();
    });

}

/*Sweetalert error for clicking things our not supposed to while recording.*/
function errormsgcantchangewhilerecording(){
    swal({
        title: "Oops..",
        text: "You can't change that while recording, Sorry!",
        type: "error",
        showCancelButton: false,
        timer: 3500,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Ok",
        closeOnConfirm: true
    });
}

/*This function updates the metadata to the encoder and presses the update button.*/
/*Purely made to write less code :)*/
function updatemetadatetoencoder(successfunction){
    setMetaData('Title',$("#metatitle").val(), function(){
        setMetaData('Description',$("#metadescription").val(), function(){
            btnPress('updateprojectinfo', function(){
                if(successfunction != null) successfunction();
            });
        });
    });
}

/*Before the actual recording starts and you pressing the button can be a delay.*/
/*This function shows a nice popup that shows how long it takes before you start recording and closes itself when the recording has started.*/
function setcountdown(type){
    window.countingdown = true;
    getConfiguration("startdelay", function(sec){
        var swaltext = "";
        var secondswaltext = "";
        var swaltitle = "";
        if(type == "live"){
            swaltext = "Get set, get ready and in " + sec + " seconds the live session will start! This message will automatically disappear when your live session has started";
            secondswaltext = "We are live right now";
            swaltitle = "Live!"
        }
        else{
            swaltext = "Get set, get ready and in " + sec + " seconds we start recording! This message will automatically disappear when the recording starts!";
            secondswaltext = "We are recording right now!";
            swaltitle = "Recording!"
        }

        btnPress('Startpause');
        if(sec > 0){
            swal({
                title: "Get set",
                text: swaltext,
                type: "info",
                showCancelButton: false,
                showConfirmButton: false,
                timer: ((sec*1000)+1200),
                closeOnConfirm: false,
                allowEscapeKey: false
            },
            function(){
                setTimeout(function(){
                    window.countingdown = false;
                    getRecStatus(function(j){
                        if(j == "Recording " || j == "Live"){
                            swal({
                                title: swaltitle,
                                text: secondswaltext,
                                type: "success",
                                showCancelButton: false,
                                showConfirmButton: false,
                                timer: 1500,
                                allowEscapeKey: false
                            });
                        }else{
                            setTimeout(function(){
                                getRecStatus(function(j){
                                    if(j == "Recording " || j == "Live"){
                                        swal({
                                            title: swaltitle,
                                            text: secondswaltext,
                                            type: "success",
                                            showCancelButton: false,
                                            showConfirmButton: false,
                                            timer: 1000,
                                            allowEscapeKey: false
                                        });
                                    }else{
                                        swal({
                                            title: "Oops...",
                                            text: "The recording didn't start. This might be because you canceled the delay in the recorder or it might be some other problem. Please check the Presentations2go encoder for the status.",
                                            type: "error",
                                            showCancelButton: false,
                                            allowEscapeKey: false
                                        });
                                    }
                                });
                            },2700);
                        }
                    });
                }, 700);
            });
        }else{
            window.countingdown = false;
        }
    });
}

function checkdelaynr(nr){
    if(nr <= 1000){
        setConfiguration("startdelay", nr);
    }else if(nr > 1000){
        setConfiguration("startdelay", "1000");
        $("#delaynr").val(1000);
    }else{
        setConfiguration("startdelay", "0");
        $("#delaynr").val(0);
        swal({
            title: "Oops..",
            text: "You can only enter numbers!",
            type: "error",
            showCancelButton: false,
            closeOnConfirm: true
        });
    }
}

function stopandhidepopoutimgp2(){
    $("#imgpopupouter").css("visibility", "hidden");
    $("#closeimgbtn").css("visibility", "hidden");
    clearInterval(window.intervalimgclick);
}

function gotopage1(device){
    initializesingleimagevent(".VideoSource");
    //initializesingleimagevent(".SlideSource");
    $(".ball").attr("class", "ball");
    $("#bp1").attr("class", "ball activepageindicator");
    stopandhidepopoutimgp2();
    $("#page2, #info, #page3").stop(false, true);
    $(".item1").attr("class", "item1 active");
    $(".item2").attr("class", "item2");
    $(".item3").attr("class", "item3");

    if(device != "mobile"){
        $("#page3").animate({
            left: "1400px"
        }, 700, function(){
            clearInterval(window.p3defaultimgvideo);
            clearInterval(window.p3defaultimgslide);
        });
        $("#page2").animate({
            left: "700px"
        }, 700, function(){
            clearInterval(window.p2defaultimgvideo);
            clearInterval(window.p2defaultimgslide);
        });
        $("#info").animate({
            left: 0
        }, 700);
    }
}

function gotopage2(device){
    window.p2defaultimgvideo = initializeimagevent(".VideoSource", 4000);
    //window.p2defaultimgslide = initializeimagevent(".SlideSource", 5000);
    $(".ball").attr("class", "ball");
    $("#bp2").attr("class", "ball activepageindicator");
    stopandhidepopoutimgp2();
    $("#page2, #info, #page3").stop(false, true);
    $(".item1").attr("class", "item1");
    $(".item2").attr("class", "item2 active");
    $(".item3").attr("class", "item3");

    if(device != "mobile"){
        $("#page3").animate({
            left: "700px"
        }, 700, function(){
            clearInterval(window.p3defaultimgvideo);
            clearInterval(window.p3defaultimgslide);
        });
        $("#page2").animate({
            left: 0
        }, 700);
        $("#info").animate({
            left: "-700px"
        }, 700);
    }
}

function gotopage3(device){
    initializesingleimagevent(".VideoSource");
    //initializesingleimagevent(".SlideSource");
    window.p3defaultimgvideo = initializeimagevent(".VideoSourcep3", 500);
    window.p3defaultimgslide = initializeimagevent(".SlideSourcep3", 2000);
    $(".ball").attr("class", "ball");
    $("#bp3").attr("class", "ball activepageindicator");
    stopandhidepopoutimgp2();
    $("#page2, #info, #page3").stop(false, true);
    $(".item1").attr("class", "item1");
    $(".item2").attr("class", "item2");
    $(".item3").attr("class", "item3 active");

    if(device != "mobile"){
        $("#page3").animate({
            left: 0
        }, 700);
        $("#page2").animate({
            left: "-700px"
        }, 700, function(){
            clearInterval(window.p2defaultimgvideo);
            clearInterval(window.p2defaultimgslide);
        });
        $("#info").animate({
            left: "-1400px"
        }, 700);
    }
}