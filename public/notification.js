
// request permission to notify the user

document.addEventListener('DOMContentLoaded', function() {
 if (!Notification) {
  alert("Whoops! Desktop notifications don't seem to work in your browser, trying switching to a new one so we can keep you updated!");
  return;
 }

 if (Notification.permission !== "granted") {

  Notification.requestPermission().then(permission => {
		handlePermissionStatus(permission);
	});

 }

});

function addNotification(notiTitle, textBody, iconURL, openOnClickURL) {

 if (Notification.permission !== "granted") {

  Notification.requestPermission().then(permission => {
		handlePermissionStatus(permission);
	});

 }
 else {

	 console.log("New Notification")

		var newNotification = new Notification(notiTitle, { 
			icon: iconURL,
   		body: textBody,
  });

  newNotification.onclick = function() {
  	window.open(openOnClickURL);
  };
 }

}

if (sessionStorage.getItem("visited") != "1") {
	addNotification("Welcome!", "Welcome to Blockshot, have great fun playing against your friends battling it out to the death. Enjoy!", "/images/logo.png", "")

	sessionStorage.setItem("visited", "1");
}