"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/Handler.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");

BeQuiet.Main = new function() {
	
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	const Cu = Components.utils;
	const wm = Cc["@mozilla.org/appshell/window-mediator;1"]
    	.getService(Ci.nsIWindowMediator);
	
	/**
	 * Maps regular expressions to the handlers for that site. A site can have
	 * more than one handler (e.g. YouTube, one for Flash and one for Hmtl5).
	 */
	const HANDLER_MAPPING = [ { key: /youtube.com$/, value: 'YouTube' },
	                          { key: /pandora.com$/, value: 'Pandora' },
	                          { key: /last.fm$/, value: 'LastFM' },
	                          { key: /grooveshark.com$/, value: 'Grooveshark' },
	                          { key: /playlist.com$/, value: 'Playlist' },
	                          { key: /8tracks.com$/, value: 'EightTracks' },
	                          { key: new RegExp("."), value: 'HtmlVideo' } ];
	
	let self = this;

	self.observers = new Set();
	
	self.onLocationChange = function(aBrowser, aWebProgress, aRequest, aLocation) {
    	let doc = aBrowser.contentDocument;
    	let lastDoc = aBrowser.com_sppad_BeQuiet_lastDocument;
		let win = doc.defaultView;
	    let host = doc.location.host;
		
	    if(!host)
	    	return;
	    
		if(doc.com_sppad_BeQuiet_handlers)
			return;
		
	    if(lastDoc && lastDoc != doc)
	    	self.unregisterHandlers(aBrowser.com_sppad_BeQuiet_lastDocument);
		
	    win.addEventListener('unload', self.onPageUnload, false);
	    
		self.registerHandlers(host, aBrowser, aLocation);
		aBrowser.com_sppad_BeQuiet_lastDocument = doc;
    };
    
    self.registerHandlers = function(aHost, aBrowser, aLocation) {
    	let contentDocument = aBrowser.contentDocument;
        contentDocument.com_sppad_BeQuiet_handlers = new Set();
    	
    	for(let entry of HANDLER_MAPPING) {
    		if(!entry.key.test(aHost))
    			continue;
    		
    		Components.utils.import("chrome://BeQuiet/content/sites/" + entry.value + ".jsm");
    		
			let constructor = BeQuiet[entry.value];
			let factoryFunction =  constructor.bind.apply(constructor, [ aBrowser ]);
   				
			let handler = new factoryFunction(aBrowser);
			contentDocument.com_sppad_BeQuiet_handlers.add(handler);
    	}
    };
    
    self.unregisterHandlers = function(aDocument) {
    	if(aDocument.com_sppad_BeQuiet_handlers)
			for(let handler of aDocument.com_sppad_BeQuiet_handlers)
				handler.cleanup();
    };
    
    self.onPageUnload = function(aEvent) {
	    self.unregisterHandlers(aEvent.target);
	};
	
	self.onTabClose = function(aEvent) {
		let tab = aEvent.target;
		let browser = gBrowser.getBrowserForTab(tab);
		
	    self.unregisterHandlers(browser.contentDocument);
	};
	
	self.onWindowClose = function(aEvent) {
		let browserWindow = aEvent.target;
		
		for(let browser of browserWindow.gBrowser.browsers)
		    self.unregisterHandlers(browser.contentDocument);
	};
	
	self.getHandlers = function() {
	    for(let window of self.getWindows())
	    	for(let browser of window.gBrowser.browsers)
	    		if(browser.contentDocument.com_sppad_BeQuiet_handlers)
	    			for(let handler of browser.contentDocument.com_sppad_BeQuiet_handlers)
	    				yield handler;
	};
	
	self.getTabForBrowser = function(aBrowser) {
		let gBrowser = self.getWindowForBrowser(aBrowser).gBrowser;
		
		return BeQuiet.Iterable.from(gBrowser.tabs)
			.filter(function(tab) { return gBrowser.getBrowserForTab(tab) === aBrowser })
			.first();
	};
	
	self.getWindowForBrowser = function(aBrowser) {
	    for(let window of self.getWindows())
	    	for(let browser of window.gBrowser.browsers)
	    		if(browser === aBrowser)
	    			return window;
	    
	    throw new Error("Window for browser not found");
	};
	
	self.getWindows = function() {
		let enumerator = wm.getEnumerator("navigator:browser");
    	while (enumerator.hasMoreElements())
    		yield enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
	};
	
	self.handlesSelectedTab = function(aHandler) {
		let window = wm.getMostRecentWindow("navigator:browser");
		let gBrowser = window.gBrowser;
		
		return gBrowser.getBrowserForTab(gBrowser.selectedTab) === aHandler.browser;
	};
	
	self.onPlay = function(aEvent) {
		for(let observer of self.observers)
			observer.onPlay(aEvent.handler);
	};
	
	self.onPause = function(aEvent) {
		for(let observer of self.observers)
			observer.onPause(aEvent.handler);
	};
	
	self.addObserver = function(observer) {
		self.observers.add(observer);
	};
	
	self.removeObserver = function(observer) {
		self.observers.delete(observer);
	};
	
	self.setupWindow = function(aWindow) {
		// Checks for initial add-on install and sets up toolbar button
		aWindow.addEventListener("load", function() {
			aWindow.Application.getExtensions(function (extensions) {
			    if (extensions.get("BeQuiet@com.sppad").firstRun) {
			        var toolbar = aWindow.document.getElementById('nav-bar');
			
			        toolbar.insertItem('com_sppad_beQuiet_media_playPause', null);
			        toolbar.setAttribute("currentset", toolbar.currentSet);
			        aWindow.document.persist(toolbar.id, "currentset");
			    }
			});
		});
		
		aWindow.addEventListener("load", function() {
			aWindow.gBrowser.addTabsProgressListener(self);
			aWindow.addEventListener('unload', self.onWindowClose, false);

			let tabContainer = aWindow.gBrowser.tabContainer;
	        tabContainer.addEventListener("TabClose", self.onTabClose, false);
	        
			aWindow.document.addEventListener("com_sppad_handler_play", self.onPlay, false);
			aWindow.document.addEventListener("com_sppad_handler_pause", self.onPause, false);
		});
		
		aWindow.addEventListener("unload", function() {
			aWindow.gBrowser.removeTabsProgressListener(self);
			aWindow.removeEventListener('unload', self.onWindowClose);

			let tabContainer = aWindow.gBrowser.tabContainer;
	        tabContainer.removeEventListener("TabClose", self.onTabClose);
	        
			aWindow.document.removeEventListener("com_sppad_handler_play", self.onPlay);
			aWindow.document.removeEventListener("com_sppad_handler_pause", self.onPause);
		});
	};
};