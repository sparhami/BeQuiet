var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Tabs = new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
    self.onPause = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = BeQuiet.Main.getTabForBrowser(browser);
    	tab.removeAttributeNS(BeQuiet.xmlns, 'mediaPlaying');
   		tab.removeAttributeNS(BeQuiet.xmlns, 'usePlayingAnimation');
    	
    	self.restoreTabIcon(tab, browser.currentURI);
    };
    
    self.onPlay = function(aEvent) {
    	let browser = aEvent.handler.browser;
    	
    	let tab = BeQuiet.Main.getTabForBrowser(browser);
      	tab.setAttributeNS(BeQuiet.xmlns, 'mediaPlaying', 'true');
      	
      	if(prefs.usePlayingIcon) {
        	tab.removeAttribute('image');		
      	}
      	
      	if(prefs.usePlayingAnimation) {
      		tab.setAttributeNS(BeQuiet.xmlns, 'usePlayingAnimation', 'true');
      	}
    };
    
    self.restoreTabIcon = function(aTab, aUri) {
    	faviconService.getFaviconURLForPage(aUri, function(icon) {
    		icon && aTab.setAttribute('image', icon.asciiSpec);	
		});
    };
    
	self.setupWindow = function(aWindow) {
		aWindow.addEventListener("load", function() {
			aWindow.document.addEventListener("com_sppad_handler_play", self.onPlay, false);
			aWindow.document.addEventListener("com_sppad_handler_pause", self.onPause, false);
		});
		
		aWindow.addEventListener("unload", function() {
			aWindow.document.removeEventListener("com_sppad_handler_play", self.onPlay);
			aWindow.document.removeEventListener("com_sppad_handler_pause", self.onPause);
		});
	};
};


