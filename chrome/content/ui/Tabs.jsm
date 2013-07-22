"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Tabs = new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	const faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
		.getService(Components.interfaces.mozIAsyncFavicons);
	
	let self = this;
	
    self.onPause = function(aHandler) {
    	let browser = aHandler.browser;
    	
    	let tab = BeQuiet.Main.getTabForBrowser(browser);
    	tab.removeAttributeNS(BeQuiet.xmlns, 'mediaPlaying');
   		tab.removeAttributeNS(BeQuiet.xmlns, 'usePlayingAnimation');
    	
    	self.restoreTabIcon(tab, browser.currentURI);
    };
    
    self.onPlay = function(aHandler) {
    	let browser = aHandler.browser;
    	
    	let tab = BeQuiet.Main.getTabForBrowser(browser);
      	tab.setAttributeNS(BeQuiet.xmlns, 'mediaPlaying', 'true');
      	
      	if(prefs.usePlayingIcon)
        	tab.removeAttribute('image');		
      	
      	if(prefs.usePlayingAnimation)
      		tab.setAttributeNS(BeQuiet.xmlns, 'usePlayingAnimation', 'true');
    };
    
    self.onMediaInfoChanged = function(aHandler) {

    };
    
    self.restoreTabIcon = function(aTab, aUri) {
    	faviconService.getFaviconURLForPage(aUri, function(icon) {
    		icon && aTab.setAttribute('image', icon.asciiSpec);	
		});
    };
    
	BeQuiet.Main.addObserver(self);	
};