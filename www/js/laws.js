//phonegap code
StatusBar.overlaysWebView(false);
//

var object;
var codesArray = [];
var legislature;

var hashObject = $.deparam.fragment();
var id = hashObject.id;
var full_reference = hashObject.full_reference;

document.addEventListener("deviceready", getPlatform, false);

// if the id in the URL isn't blank or undefined, then show that law
if(id != "" && id != undefined) {
	console.log("Code ID is not blank");
	$( document ).ready( function() {
		var code = id;
		
		setTimeout(function(){
			showLaw(code);
		},500);
	});
}

$(document).on("pageshow", function(e){
	console.log("pageshow happened");
	createLawsListview();
	
	//getPlatform();
});

function createLawsListview() {
	$.getJSON('json/codes.json', function(data) {
		console.log("Reading codes.json...");
		$('#codes').html(''); 
		//console.log(data);
		object = data;
	  	$.each(data.codes, function(i, code) {
	  		var identifer = code.title + "-" + code.chapter + "-" + code.section;
	  		if(code.subsection != "") {
		  		identifer += " (" + code.subsection + ")";
	  		}
			var header = code.header;
			var body = code.body;
			var codeLocation = code.codeLocation;
			var filterText = identifer + " " + code.keyword + " " + code.legislature + " " + strip_tags(code.body);
			var stub = code.legislature.toLowerCase() + "_" + code.stub;
			
			codesArray[i] = [identifer, header, body, code.legislature, stub];
			if(legislature != code.legislature) {
		  		$('#codes').append('<li data-role="list-divider">' + code.legislature + '</li>');
	  		}
			$('#codes').append('<li data-icon="false" data-filtertext="' + filterText + '" class="wrapme"><a href="javascript:showLaw(' + i + ');" class="wrapme"><p>' + identifer + '</p><h2 class="wrapme">' + header + '</h2></a></li>');
			legislature = code.legislature;
	  });
	  $("#codes").listview ("refresh");
	});
}

function showLaw(code) {

	$.mobile.changePage( "#full_reference");
	$(".advertisement").hide();
	
	window.scrollTo(0,0);
	console.log("Codes: showing code " + code);
	var identifer = codesArray[code][0];
	var header = codesArray[code][1];
	var body = codesArray[code][2];
	var legislature = codesArray[code][3];
	var stub = codesArray[code][4];
	
	var paramsStr = {id:code,topic:stub};
	$.bbq.pushState(paramsStr,2); // 0 is append, 2 is replace
	
	$("#body_area").show().html("<p class='allowCopyPaste'><b>" + legislature + "</b>: " + identifer + "</p><h2 class='allowCopyPaste'>" + header + "</h2><span class='allowCopyPaste'>" + body + "</span>");
}
function strip_tags (input, allowed) {
  // http://kevin.vanzonneveld.net
  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}

function getPlatform() {
	var platformOutput = whichPlatform();
	
	if(platformOutput.result > 0) {
		$(".storeName").html(platformOutput.store);
		$(".storeUrl").attr("href",platformOutput.storeUrl);
		$(".storeMessage").html(platformOutput.message);
		$("#storeListview").show();
	}
	
	$('.newWindowUrl').each(function() {
		// open the link in the device web browser - need to test if this works with PhoneGap
	   var a = new RegExp('/' + window.location.host + '/');
	   if(!a.test(this.href)) {
	       $(this).click(function(event) {
	           event.preventDefault();
	           event.stopPropagation();
	           window.open(this.href, '_blank');
	       });
	   }
	});
}

function whichPlatform() {
	//var devicePlatform = device.platform;
	var devicePlatform = "iOS";
	var result;
	var output, storeUrl, store, message;
	
	if(devicePlatform.search("iOS") > -1) {
		result = 1;
		store = "iOS";
		message = "Find in App Store";
		storeUrl = "https://itunes.apple.com/us/app/chicago-bike-guide/id517850448?mt=8&uo=4&at=11laCa";
	} else if(devicePlatform.search("Android") > -1) {
		result = 2;
		store = "Android";
		message = "Find in Google Play Store";
		storeUrl = "https://play.google.com/store/apps/details?id=stevevance.ChicagoOfflineBikeMap";
	} else {
		result = 0;
		store = "No store"
		storeUrl = "http://bikechi.com";
	}
	console.log("DevicePlatform: result=" + result);
	
	//output = "<a onclick=\"window.open('" + storeUrl + "','_system')\" href='#'>Download from the " + store + "</a>";
	
	output = {result:result,storeUrl:storeUrl,store:store,message:message}
	$(".storeName").html(store);
	
	return output;
}