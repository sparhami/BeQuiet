com.sppad.BeQuiet.Tabs = new function() {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
    self.onPause = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(browser);
    	tab.removeAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying');
    	
    	faviconService.getFaviconURLForPage(browser.currentURI, function(icon) {
			let image = icon ? icon.asciiSpec : 'chrome://mozapps/skin/places/defaultFavicon.png';
			tab.setAttribute('image', image);	
		});
    	
   		tab.removeAttributeNS(com.sppad.BeQuiet.xmlns, 'usePlayingAnimation');
    };
    
    self.onPlay = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(browser);
      	tab.setAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying', 'true');
      	
      	if(prefs.usePlayingIcon) {
        	tab.setAttribute('image', 'chrome://BeQuiet/skin/images/note.svg');		
      	}
      	
      	if(prefs.usePlayingAnimation) {
      		tab.setAttributeNS(com.sppad.BeQuiet.xmlns, 'usePlayingAnimation', 'true');
      	}
    };
    
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_handler_play", self.onPlay, false);
		document.addEventListener("com_sppad_handler_pause", self.onPause, false);
	});
};


