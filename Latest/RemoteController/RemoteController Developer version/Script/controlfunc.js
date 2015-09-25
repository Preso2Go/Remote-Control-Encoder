/*This function gets a new sessionId. If you give a function in "successfunction", it will excecute this function after it has got a new valid sessionId!
  successfunction: is a function which will be executed when it successfully got a new sessionId.*/
function getNewSessionId(successfunction){
    var ip = getCookie("ip");
    var Url = "http://" + ip + "?action=sendcommand&actiondetail=initializeremotecontrol&user=presentations2go&password=" + getCookie("password");

    $.ajax({

        url: Url,

        type: "Post",

        dataType: "jsonp",

        async: false,

        success: function( json ){
            var j = $.parseJSON(json);
            setCookie("sessionId",j['sessionId'],0.3);
            successfunction();
        },

        error: function( errorThrown ) {
            console.log(errorThrown);
            console.log("Got problems connecting to Encoder. Please try logging in again!");
            //window.location.href = "./";
        }
    });

}

/*Makes a call to the P2Go Encoder.
  Url: is an full url where the ajax function will go to.
  Type: makes sure some code gets executed after it got a success.
  successfunction: is a function which it executes after the ajax call got a success and the type is 'Get'.*/
function ajaxToEncoderCall(Url, Type, successfunction){
    $.ajax({

        url: Url,

        type: "Post",

        dataType: "jsonp",

        async: false,

        success: function( json ){
            var attempts = getCookie("Attempts");
            var j = JSON.parse(json);
            if (Type == 'GetMetaData') {
                /*Executes the successfunction and gives the metadata that has been asked for with it.*/
                successfunction(j['metadata'][0]['value']);
            } else if (Type == 'GetConfiguration') {
                /*console.log(j['configurations'][0]['value']);
                Executes the successfunction and gives the configuration that has been asked for with it.*/
                successfunction(j['configurations'][0]['value']);
            } else if (successfunction != null) {
                successfunction();
            }
        },

        error: function( errorThrown ) {
            console.log(errorThrown);
            console.log("Cannot connect to Encoder. Please try logging in again!");
            //window.location.href = "./";
        }
    });

}

/*This function can be called to precess a call to the Encoder. It will get a valid sessionId before it executes the call.
  This way, you can move the mouse by accident on the encoder computer and it will still process the call correctly and successfully.
  Action: is he action in the url. Ex: 'SendCommand'.
  actiondetail: is the full next part of the url. Ex: 'actiondetail=Startpause'
  Type: type gets passed on to the ajaxToEncoderCall function.
  successfunction: A function which is passed on into ajaxToEncoderCall and the function gets excecuted after it successfully executed the ajax call to the Encoder.*/
function processCall(action, actiondetail, Type, successfunction){
    getNewSessionId(function(){
        var ip = getCookie("ip");
        var password = getCookie("password");
        var sessionId = getCookie("sessionId");
        var Url = "http://" + ip + "?action=" + action + "&" + actiondetail + "&user=presentations2go&password=" + password + "&sessionId=" + sessionId;
        ajaxToEncoderCall(Url, Type, successfunction);
    });

}

/*This function can be called to set some Metadata in the encoder.
  Type: What metadata you want changed. Ex: 'Title'.
  Data: The data you want the type changed to.*/
function setMetaData(type, data, successfunction){
    if(data == "")data = "unknown";
    var actiondetail = type + "=" + data;

    if(successfunction != null){
        processCall("SetMetadata", actiondetail, "Set", successfunction);
    }else{
        processCall("SetMetadata", actiondetail, "Set");
    }
}

/*This function can be called to get some Metadata.
  Type: is what metadata you want returned. Ex: 'Title'.
  successfunction: A function which will be executed when it got the metadata. Ex: where you want the metadata to go.*/
function getMetaData(type, successfunction){
    var actiondetail = "actionDetail=" + type;
    processCall("GetMetadata", actiondetail, "GetMetaData", successfunction);
}

/*This function can be called to set some Configuration in the encoder.
  Type: What configuration you want changed. Ex: 'noslide'.
  Data: The data you want the type changed to.*/
function setConfiguration(type, data, successfunction){
    var actiondetail = type + "=" + data;

    if(successfunction != null){
        processCall("SetConfiguration", actiondetail, "Set", successfunction);
    }else{
        processCall("SetConfiguration", actiondetail, "Set");
    }
}

/*This function can be called to get some configuration.
  Type: is what configuration you want returned. Ex: 'noslide'.
  successfunction: A function which will be executed when it got the configuration. Ex: where you want the metadata to go.*/
function getConfiguration(type, successfunction){
    var actiondetail = "actionDetail=" + type;
    processCall("GetConfiguration", actiondetail, "GetConfiguration", successfunction);
}

/*This function can be called to get the current state of recording.
  successfunction: A function which will be executed when it got the configuration. Ex: where you want the metadata to go.*/
function getRecStatus(successfunction){
    processCall("info", "actionDetail=status", "GetConfiguration", successfunction);
}