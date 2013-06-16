com.sppad.BeQuiet.Tabs = new function() {
	
	let self = this;
	
	self.faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
    this.onPause = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(browser);
    	tab.removeAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying');
    	
    	self.faviconService.getFaviconURLForPage(browser.currentURI, function(icon) {
			let image = icon ? icon.asciiSpec : 'chrome://mozapps/skin/places/defaultFavicon.png';
			tab.setAttribute('image', image);	
		});
    };
    
    this.onPlay = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(browser);
      	tab.setAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying', 'true');
      	
    	tab.setAttribute('image', 'chrome://BeQuiet/skin/images/note.svg');
    };
    
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_handler_play", self.onPlay, false);
		document.addEventListener("com_sppad_handler_pause", self.onPause, false);
	});
};


