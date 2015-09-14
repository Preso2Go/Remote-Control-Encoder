//When the document is fully loaded it executes the function.
$(document).ready(function(){
	//This cookie is used to check how many times the program has tried to connect successfully with the encoder.
	//After a specified amount of attempts the user will get an error and has to log back in.
	setCookie("Attempts",0,1);

	getConfiguration("startdelay", function(sec){
		$("#delaynr").val(sec);
	});

	//Gets rid of any errors
	$("#errorfield").empty();

	//Fills the current metadata from the Encoder in the web page.
	getMetadataAndFillHtml("#metatitle","Title", function(){
		getMetadataAndFillHtml("#metadescription","Description", function(){
			//Uses the current configuration from the Encoder in the webpage.
			getConfigurationAndUse("#1","live", function(){
				getConfigurationAndUse("#2","autopublish", function(){
					//Sets configuration in the encoder, because you can't get "noslide".
					//So to make sure the webpage knows what the value is, it sets it to false in the encoder
					setConfiguration("noslide", "false", function(){
						//Checks what state the record button is in and changes the button in the webpage according.
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
	//TODO: Make it so the user knows that the encoder has different information that you. Maybe show the encoders information so the user can chose which to keep.
	//TODO: Current record setting should update. If the recording is live, the live checkbox should be checked to. If the encoder is recording something, update noslide aswell, if possible :).
	////Every minute, the page gets updated, for if something changed, it changes in the webpage.
	//setInterval(function() {
	//	getRecStatus(function(j){
	//		if(j == "Recording "){
	//			window.isrecording = true;
	//			window.currentlylive = false;
	//			$("#recpausebtn p:first-child").attr("id","pause").empty();
	//			$("#recpausebtn").attr("title", "Pause").removeAttr("class");
	//		}else if(j == "Live"){
	//			window.isrecording = true;
	//			window.currentlylive = true;
	//			$("#recpausebtn").attr("class", "liverecording").attr("title", "You are live right now");
	//			$("#recpausebtn p:first-child").attr("id","pause").empty();
	//		}else if(j == "Recording  (Paused) "){
	//			window.isrecording = true;
	//			window.currentlylive = false;
	//			$("#recpausebtn").attr("title", "Resume").removeAttr("class");
	//			$("#recpausebtn p:first-child").attr("id","resume").append("<p></p>").append("<p></p>");
	//		}else{
	//			window.isrecording = false;
	//			window.currentlylive = false;
	//			$("#recpausebtn").attr("title", "Record").attr("class", "recstatus");
	//			$("#recpausebtn p:first-child").attr("id","record").empty();
	//		}
	//		getMetadataAndFillHtml("#metatitle","Title", function(){
	//			getMetadataAndFillHtml("#metadescription","Description", function(){
	//				//Uses the current configuration from the Encoder in the webpage.
	//				getConfigurationAndUse("#1","live", function(){
	//					getConfigurationAndUse("#2","autopublish");
	//				});
	//			});
	//		});
	//	});
	//}, 60 * 1000);

	if(getCookie("understandwarning") == "true"){
		$("#infofield").remove();
	}

	initializeremotecontrollerevents();

	//Checks if cookies are enabled on the webbrowser. If not, the user gets redirected to a page that shows how to enable them.
	checkCookiesEnables();
});

//This function will log you out and bring you to the login screen.
function logout(){
	window.location.href = "./";
}

//This function gets some metadata and fills it in an attribute in html.
//Attribute: it will fill the metadata in that attribute inside the html.
//Type: is what metadata you want returned. Ex: 'Title'.
function getMetadataAndFillHtml(attribute, type, successfunction){
	getMetaData(type, function(j){
		$(attribute).empty().html(j);
		$(attribute).empty().val(j);
		successfunction();
	});
}

//This function gets some configuration and can use it in the html.
//Attribute: what is going to change in the html.
//Type: is what configuration you want returned. Ex: 'live'.
function getConfigurationAndUse(attribute, type, successfunction){
	getConfiguration(type, function(j){
		if(j == true){
			$(attribute).prop("checked", true);
			$(attribute).next().attr("class", "activechkbx");
		}else{
			$(attribute).prop("checked", false);
		}
		successfunction();
	});
}

//This function will press a button in the encoder.
//Buttontype: is the button which will be pressed. Ex: 'Startpause'.
function btnPress(buttontype, successfunction){
	var actiondetail = "actiondetail=" + buttontype;
	processCall("sendcommand", actiondetail, "btnpress", successfunction);
}

function initializeimagevent(imgid){
	var url="http://" + getCookie("ip") + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + getCookie("password");
	$(imgid).attr("src", url);

	setInterval(function(){
		var d = new Date();
		var url="http://" + getCookie("ip") + "?action=getvisualelement&actiondetail=status&user=presentations2go&password=" + getCookie("password") + "&min=" + d.getSeconds();
		$(imgid).attr("src", url);
	}, 5000);
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
	processCall("SendCommand", "actiondetail="+camerafunction, "camera");
}