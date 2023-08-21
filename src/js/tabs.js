import { ctx, toggleMenu, toggleMessage } from './state.js';
import { list_devices, upload_video } from './media_video.js'
import { media_populate, media_populate_user, upload_image } from './media.js';

// As per https://www.w3schools.com/howto/howto_js_tabs.asp
export function openTab(evt, tabname) {
	// Declare all variables
	var i, tabcontent, tablinks;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");

	var tabCount = tablinks.length;
	var closeTabCount = document.getElementsByClassName("closeTab").length;
	var actualTabCount = tabCount - closeTabCount;
	var tabWidth = 100 / actualTabCount;

	for (i = 0; i < tablinks.length; i++) {
		if (tablinks[i].className.indexOf("closeTab") === -1) {
			tablinks[i].style.width = tabWidth + '%';
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	if (evt) {
		document.getElementById(tabname).style.display = "flex";
		evt.currentTarget.className += " active";
	};
}

export function setupTabs() {
	document.getElementById('tab_about').addEventListener(
		'click', function (event) {
			openTab(event, 'about');
		}
	);
	document.getElementById('tab_media').addEventListener(
		'click', function (event) {
			openTab(event, 'media');
		}
	);
	document.getElementById('tab_user').addEventListener(
		'click', function (event) {
			openTab(event, 'media_user');
		}
	);
	document.getElementById('tab_connect').addEventListener(
		'click', function (event) {
			openTab(event, 'connect');
		}
	);
	document.getElementById('upload-image').onclick = function () {
		upload_image();
	};
	document.getElementById('upload-video').onclick = function () {
		upload_video();
	};
	document.getElementById('webcam').onclick = function () {
		list_devices();
	};
	document.getElementById('tab_close').onclick = function () {
		toggleMenu();
	};
	document.getElementById("tab_about").click();

	document.getElementById('image_multi').addEventListener('click',
		function (event) {
			event.stopPropagation();
		}
	);
	document.getElementById('vid_multi').addEventListener('click',
		function (event) {
			event.stopPropagation();
		}
	);
	document.getElementById('dev_multi').addEventListener('click',
		function (event) {
			event.stopPropagation();
		}
	);

	document.getElementById('message_close').onclick = function () {
		toggleMessage();
	};

	ctx.dom.message.style.display = 'none';

	media_populate();
	media_populate_user();
}