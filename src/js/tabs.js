// As per https://www.w3schools.com/howto/howto_js_tabs.asp
export function openTab(evt, cityName) {
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
		document.getElementById(cityName).style.display = "flex";
		evt.currentTarget.className += " active";
	};
}