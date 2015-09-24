/*When the document is fully loaded it executes the function.*/
$(document).ready(function(){
	window.haschanged = false;
	/*This cookie is used to check how many times the program has tried to connect successfully with the encoder.*/
	/*After a specified amount of attempts the user will get an error and has to log back in.*/
	setCookie("Attempts",0,1);

	getConfiguration("startdelay", function(sec){
		$("#delaynr").val(sec);
	});

	/*Gets rid of any errors*/
	$("#errorfield").empty();

	//Fills the current metadata from the Encoder in the web page.
	getMetadataAndFillHtml("#metatitle","Title", function(){
		getMetadataAndFillHtml("#metadescription","Description", function(){
			/*Uses the current configuration from the Encoder in the webpage.*/
			getConfigurationAndUse("#1","live", function(){
				getConfigurationAndUse("#2","autopublish", function(){
					/*Sets configuration in the encoder, because you can't get "noslide".*/
					/*So to make sure the webpage knows what the value is, it sets it to false in the encoder*/
					setConfiguration("noslide", "false", function(){
						/*Checks what state the record button is in and changes the button in the webpage according.*/
						getRecStatus(function(j){
							if(j == "Recording "){
								window.isrecording = true;
								window.currentlylive = false;
								updatelivecheckbox();
								$("#recpausebtn p:first-child").attr("id","pause").empty();
								$("#recpausebtn").attr("title", "Pause").removeAttr("class");
							}else if(j == "Live"){
								window.isrecording = true;
								window.currentlylive = true;
								updatelivecheckbox();
								$("#recpausebtn").attr("class", "liverecording").attr("title", "You are live right now");
								$("#recpausebtn p:first-child").attr("id","pause").empty();
							}else if(j == "Recording  (Paused) "){
								window.isrecording = true;
								window.currentlylive = false;
								updatelivecheckbox();
								$("#recpausebtn").attr("title", "Resume").removeAttr("class");
								$("#recpausebtn p:first-child").attr("id","resume").append("<p></p>").append("<p></p>");
							}
						});
					});
				});
			});
		});
	});
	//TODO: Finish this
	//TODO: When the screen had not been closed, the next screen should not try to look if something is different
	setInterval(function() {
		if(!window.haschanged) {
			getRecStatus(function (j) {
				if (j == "Recording ") {
					window.isrecording = true;
					window.currentlylive = false;
					$("#recpausebtn p:first-child").attr("id", "pause").empty();
					$("#recpausebtn").attr("title", "Pause").removeAttr("class");
				} else if (j == "Live") {
					window.isrecording = true;
					window.currentlylive = true;
					$("#recpausebtn").attr("class", "liverecording").attr("title", "You are live right now");
					$("#recpausebtn p:first-child").attr("id", "pause").empty();
				} else if (j == "Recording  (Paused) ") {
					window.isrecording = true;
					window.currentlylive = false;
					$("#recpausebtn").attr("title", "Resume").removeAttr("class");
					$("#recpausebtn p:first-child").attr("id", "resume").append("<p></p>").append("<p></p>");
				} else {
					window.isrecording = false;
					window.currentlylive = false;
					$("#recpausebtn").attr("title", "Record").attr("class", "recstatus");
					$("#recpausebtn p:first-child").attr("id", "record").empty();
				}
				var datachanged = false;
				var changedtextstring = [];
				getMetaData("Title", function (j) {
					if ($("#metatitle").val() != j) {
						datachanged = true;
						changedtextstring[0] = "<li>Title: <ul class=inlinelist><li><b style='font-weight: bold;'>your:</b> &quot;" + $("#metatitle").val() + "&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + j + "&quot;</li></ul></li>"
					}
					getMetaData("Description", function (k) {
						if ($("#metadescription").val() != k) {
							datachanged = true;
							changedtextstring[1] = "<li>Description: <ul class=inlinelist><li><b style='font-weight: bold;'>your:</b> &quot;" + $("#metadescription").val() + "&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + k + "&quot;</li></ul></li>"
						}
						getConfiguration("live", function (l) {
							if (l != $("#1").prop('checked')) {
								datachanged = true;
								changedtextstring[2] = "<li>Live checkbox: <ul class=inlinelist><li><b style='font-weight: bold;'>your:</b> &quot;" + ($("#1").is(':checked') ? "checked" : "unchecked") + "&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + (l ? "checked" : "unchecked") + "&quot;</li></ul></li>"
							}
							getConfiguration("autopublish", function (m) {
								if (m != $("#2").prop('checked')) {
									datachanged = true;
									changedtextstring[3] = "<li>Autopublish checkbox: <ul class=inlinelist><li><b style='font-weight: bold;'>your:</b> &quot;" + ($("#2").is(':checked') ? "checked" : "unchecked") + "&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + (m ? "checked" : "unchecked") + "&quot;</li></ul></li>"
								}
								//getConfiguration("noslide", function(n){
								//	if(n != $("#3").prop('checked')){
								//		datachanged = true;
								//		changedtextstring[4] = "<li>NoSlides checkbox: <ul class=inlinelist><li><b style='font-weight: bold;'>your:</b> &quot;" + $("#3").is(':checked')? "checked" : "unchecked" + "&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + (n ? "checked" : "unchecked")+ "&quot;</li></ul></li>"
								//	}
									//TODO: cange volume to something that works
									//getConfiguration("volume", function(o){
									//	if(o != $("#slider").slider("option", "value")){
									//		datachanged = true;
									//		changedtextstring[5] = "<li>Volume: <ul class=inlinelist><li><b style='font-weight: bold;'>your:</b> &quot;" + $("#slider").slider("option", "value") + "&#37;&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + o + "&#37;&quot;</li></ul></li>"
									//	}
										getConfiguration("startdelay", function (p) {
											if (p != $("#delaynr").val()) {
												datachanged = true;
												changedtextstring[6] = "<li>StartDelay has changed! <ul class=inlinelist><li><b style='font-weight: bold;'>your</b> &quot;" + $("#delaynr").val() + " Seconds&quot;</li><li><b style='font-weight: bold;'>software:</b> &quot;" + p + " Seconds&quot;</li></ul></li>"
											}
											if (datachanged) {
												window.haschanged = true;
												var newtextstring = "";
												for (var i = 0; i <= 6; i++) if (changedtextstring[i] != null) newtextstring += changedtextstring[i];
												swal({
														title: "Data changed",
														text: "We can see your data changed from the encoder. <br> This is what changed: <div id=scroller><ul id=valchangedwithencoder>" + newtextstring + "</ul></div> Do you want to change your settings or the settings in the software?",
														type: "warning",
														showCancelButton: true,
														confirmButtonColor: "#DD6B55",
														confirmButtonText: "Change the setings in the software",
														cancelButtonText: "Change my settings",
														closeOnConfirm: true,
														closeOnCancel: true,
														showLoaderOnConfirm: true,
														//showLoaderOnCancel: true,
														html: true
													},
													function (isConfirm) {
														if (isConfirm) {
															//TODO: change current encoder settings to mine
															setMetaData("Title", $("#metatitle").val(), function () {
																setMetaData("Description", $("#metadescription").val(), function () {
																	setConfiguration("live", $("#1").prop('checked'), function () {
																		setConfiguration("autopublish", $("#2").prop('checked'), function () {
																			//setConfiguration("noslide", $("#3").prop('checked'), function(){
																			//	setConfiguration("mastervolume", $("#slider").slider("option", "value"), function(){
																					setConfiguration("startdelay", $("#delaynr").val(), function(){
																						window.haschanged = false;
																					});
																			// 	});
																			//});
																		});
																	});
																});
															});
														} else {
															//TODO: change my settings to encoder settings
															$("#metatitle").val(j);
															$("#metadescription").val(k);
															if (l)$("#1").prop("checked", true).next().attr("class", "activechkbx");
															else $("#1").prop("checked", false).next().removeClass();
															if (m)$("#2").prop("checked", true).next().attr("class", "activechkbx");
															else $("#2").prop("checked", false).next().removeClass();
															//if(n)$("#3").prop("checked", true).next().attr("class", "activechkbx");
															//else $("#3").prop("checked", false).next().removeClass();
															//TODO: change the volume
															//
															$("#delaynr").val(p);
															window.haschanged = false;
														}
													});
											}
										});
									//});
								//});
							});
						});
					});
				});
			});
		}
	}, 120 * 1000);/*120 second interval*/

	if(getCookie("understandwarning") == "true"){
		$("#infofield").remove();
	}

	initializeremotecontrollerevents();

	/*Checks if cookies are enabled on the webbrowser. If not, the user gets redirected to a page that shows how to enable them.*/
	checkCookiesEnables();
});

/*This function will log you out and bring you to the login screen.*/
function logout(){
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|NokiaBrowser/i.test(navigator.userAgent) ) window.location.href = "mobile_index.html";
	else window.location.href = "./";
}

/*This function gets some metadata and fills it in an attribute in html.*/
/*Attribute: it will fill the metadata in that attribute inside the html.*/
/*Type: is what metadata you want returned. Ex: 'Title'.*/
function getMetadataAndFillHtml(attribute, type, successfunction){
	getMetaData(type, function(j){
		$(attribute).empty().html(j);
		$(attribute).empty().val(j);
		successfunction();
	});
}
/*This function gets some configuration and can use it in the html.*/
/*Attribute: what is going to change in the html.*/
/*Type: is what configuration you want returned. Ex: 'live'.*/
function getConfigurationAndUse(attribute, type, successfunction){
	getConfiguration(type, function(j){
		if(j == true){
			$(attribute).prop("checked", true).next().attr("class", "activechkbx");
		}else{
			$(attribute).prop("checked", false);
		}
		successfunction();
	});
}

/*This function will press a button in the encoder.*/
/*Buttontype: is the button which will be pressed. Ex: 'Startpause'.*/
function btnPress(buttontype, successfunction){
	var actiondetail = "actiondetail=" + buttontype;
	processCall("sendcommand", actiondetail, "btnpress", successfunction);
}

function initializeimagevent(imgid, delayms){
	var password = getCookie("password");
	var url="http://" + location.host + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password;
	$(imgid).attr("src", url);

	return setInterval(function(){
		var d = new Date();
		var url="http://" + location.host + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + password + "&hour=" + d.getHours() + "&sec=" + d.getSeconds() + "&milisec=" + d.getMilliseconds();
		$(imgid).attr("src", url);
	}, delayms);
}
function initializesingleimagevent(imgid){
	var d = new Date();
	var url="http://" + location.host + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + getCookie("password") + "&hour=" + d.getHours() + "&sec=" + d.getSeconds() + "&milisec=" + d.getMilliseconds();
	$(imgid).attr("src", url);
}

function updatecurrentlylive(succesfunction){
	getRecStatus(function(j){
		if(j == "Live"){
			window.currentlylive = true;
		}else{
			window.currentlylive = false;
		}
		succesfunction();
	});
}

function updatelivecheckbox(succesfunction){
	getConfiguration("live",function(j){
		window.livecheckbox = j;
		if(succesfunction != null) succesfunction();
	});
}

function usecamera(camerafunction){
	console.log(camerafunction);
	processCall("SendCommand", "actiondetail="+camerafunction, "camera");
}