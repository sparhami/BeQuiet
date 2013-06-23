com.sppad.BeQuiet.Tabs = new function() {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
    self.onPause = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(browser);
    	tab.removeAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying');
   		tab.removeAttributeNS(com.sppad.BeQuiet.xmlns, 'usePlayingAnimation');
    	
    	self.restoreTabIcon(tab);

    };
    
    self.onPlay = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = com.sppad.BeQuiet.Main.getTabForBrowser(browser);
      	tab.setAttributeNS(com.sppad.BeQuiet.xmlns, 'mediaPlaying', 'true');
      	
      	if(prefs.usePlayingIcon) {
        	tab.removeAttribute('image');		
      	}
      	
      	if(prefs.usePlayingAnimation) {
      		tab.setAttributeNS(com.sppad.BeQuiet.xmlns, 'usePlayingAnimation', 'true');
      	}
    };
    
    self.restoreTabIcon = function(aTab) {
    	let uri = gBrowser.getBrowserForTab(aTab).currentURI;
    	
    	faviconService.getFaviconURLForPage(uri, function(icon) {
    		icon && aTab.setAttribute('image', icon.asciiSpec);	
		});
    };
    
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_handler_play", self.onPlay, false);
		document.addEventListener("com_sppad_handler_pause", self.onPause, false);
	});
	
	window.addEventListener("unload", function() {
		document.removeEventListener("com_sppad_handler_play", self.onPlay);
		document.removeEventListener("com_sppad_handler_pause", self.onPause);
	});
};


