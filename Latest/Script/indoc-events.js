/*Everything that can happen in the controller screen.*/
function initializeremotecontrollerevents(){
    window.isrecording = false;
    window.countingdown = false;
    window.currentorgotoscreen = 0;

    if(getCookie("password") == "" || getCookie("password") == null) window.location.href = "./";

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
    var p2defaultimgvideo;
    var p2defaultimgslide;
    var p3defaultimgvideo;
    //TODO: Fix it so when you click the other button the animation does not just finished and goes back, but goes back from that point.
    $("#item1").on('click', function(){
        initializesingleimagevent(".VideoSource");

        $("#page2, #info, #page3").stop(false, true);
        $("#item1").attr("class", "menuitems active");
        $("#item2, #item3").attr("class", "menuitems");
        $("#page3").animate({
            left: "1400px"
        }, 700, function(){
            clearInterval(p3defaultimgvideo);
        });
        $("#page2").animate({
            left: "700px"
        }, 700, function(){
            clearInterval(p2defaultimgvideo);
        });
        $("#info").animate({
            left: 0
        }, 700);
    });
    $("#item2").on('click', function(){
        p2defaultimgvideo = initializeimagevent(".VideoSource", 5000);

        $("#page2, #info, #page3").stop(false, true);
        $("#item2").attr("class", "menuitems active");
        $("#item1, #item3").attr("class", "menuitems");
        $("#page3").animate({
            left: "700px"
        }, 700, function(){
            clearInterval(p3defaultimgvideo);
        });
        $("#page2").animate({
            left: 0
        }, 700);
        $("#info").animate({
            left: "-700px"
        }, 700);
    });
    $("#item3").on('click', function(){
        initializesingleimagevent(".VideoSource");
        p3defaultimgvideo = initializeimagevent(".VideoSourcep3", 700);

        $("#page2, #info, #page3").stop(false, true);
        $("#item3").attr("class", "menuitems active");
        $("#item1, #item2").attr("class", "menuitems");
        $("#page3").animate({
            left: 0
        }, 700);
        $("#page2").animate({
            left: "-700px"
        }, 700, function(){
            clearInterval(p2defaultimgvideo);
        });
        $("#info").animate({
            left: "-1400px"
        }, 700);
    });

    /*Images on page 2*/
    //TODO: When click on the image, popup screen appears. and the image is shown and updated very fast.
    $("#click1").on('click', function() {
        /*var password = getCookie("password");
        var intervalimgclick1 = setTimeout(function () {
            var d = new Date();
            var url = "http://" + getCookie("ip") + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&min=" + d.getSeconds();
            $("#imgclick1").attr("src", url);
        }, 200);*/
    });
    $("#click2").on('click', function(){
        /*var password = getCookie("password");
        var intervalimgclick2 = setTimeout(function () {
            var d = new Date();
            var url = "http://" + getCookie("ip") + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&min=" + d.getSeconds();
            $("#imgclick2").attr("src", url);
        }, 200);*/
    });

    /*The delay nr buttons on mobile*/
    $("#min").on("click", function(){
        var nr = parseInt($("#delaynr").val());
        $("#delaynr").val(nr -= 1);
        checkdelaynr($("#delaynr").val());
    });
    $("#plus").on("click", function(){
        var nr = parseInt($("#delaynr").val());
        $("#delaynr").val(nr += 1);
        checkdelaynr($("#delaynr").val());
    });

    /*Events for remotecontroller on mobile*/
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|NokiaBrowser/i.test(navigator.userAgent) ) {
        $("#maincontainer").on("swipeleft", function(){
            if($("#info").css("left") != "-1400px" && window.currentorgotoscreen < 2){
                window.currentorgotoscreen += 1;
                /*initializeimagevent("#VideoSource");*/
                /*initializeimagevent("#SlideSource");*/
                $("#page2, #info").animate({
                    left: "-=900px"
                }, 700);
            }
        }).on("swiperight", function(){
            if($("#info").css("left") != "0px" && window.currentorgotoscreen > 0){
                window.currentorgotoscreen -= 1;
                /*initializeimagevent("#VideoSource");*/
                /*initializeimagevent("#SlideSource");*/
                $("#page2, #info").animate({
                    left: "+=900px"
                }, 700);
            }
        });
        var slider = $("#slider").slider({
            animation: true,
            value: 0,
            stop: function( event, ui ) {}
        }).on("slidestop", function( event, ui ){
            setConfiguration("mastervolume",ui.value);
        });

    //Events for remotecontroller on desktop*/
    }else{
        /*$("#maincontainer").on("swipeleft", function(){
            console.log("swiped left");
            if($("#info").css("left") != "-1400px"){

                $("#page2, #info").animate({
                    left: "-=700px"
                }, 700);
            }
        }).on("swiperight", function(){
            console.log("swiped right");
            if($("#info").css("left") != "0px"){
                initializeimagevent("#VideoSource");
                initializeimagevent("#SlideSource");
                $("#page2, #info").animate({
                    left: "+=700px"
                }, 700);
            }
        });*/
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