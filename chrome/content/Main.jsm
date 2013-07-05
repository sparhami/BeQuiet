var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/MediaState.jsm");
Components.utils.import("chrome://BeQuiet/content/ui/Tabs.jsm");
Components.utils.import("chrome://BeQuiet/content/ui/Controls.jsm");
Components.utils.import("chrome://BeQuiet/content/ui/Menu.jsm");
Components.utils.import("chrome://BeQuiet/content/Handler.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/EightTracks.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/Grooveshark.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/HtmlVideo.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/LastFM.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/Pandora.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/Playlist.jsm");
Components.utils.import("chrome://BeQuiet/content/sites/YouTube.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/SetMultiMap.jsm");

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
	const HANDLER_MAPPING = [ { key: /youtube.com$/, value: BeQuiet.YouTube },
	                          { key: /pandora.com$/, value: BeQuiet.Pandora },
	                          { key: /last.fm$/, value: BeQuiet.LastFM },
	                          { key: /grooveshark.com$/, value: BeQuiet.Grooveshark },
	                          { key: /playlist.com$/, value: BeQuiet.Playlist },
	                          { key: /8tracks.com$/, value: BeQuiet.EightTracks },
	                          { key: new RegExp("."), value: BeQuiet.HtmlVideo } ];
	
	let self = this;

	/** Maps documents to the handlers for that document */
	self.handlers = new BeQuiet.SetMultiMap();
	
	self.onLocationChange = function(aBrowser, aWebProgress, aRequest, aLocation) {
    	let doc = aBrowser.contentDocument;
		let win = doc.defaultView;
	    let host = doc.location.host;
		
	    if(!host)
	    	return;
	    
		if(self.handlers.containsKey(doc))
			return;
		
	    if(aBrowser.com_sppad_BeQuiet_lastDocument != doc)
	    	self.unregisterHandlers(aBrowser.com_sppad_BeQuiet_lastDocument);
		
	    win.addEventListener('unload', self.onPageUnload, false);
	    
		self.registerHandlers(host, aBrowser, aLocation);
		aBrowser.com_sppad_BeQuiet_lastDocument = doc;
    };
    
    self.registerHandlers = function(aHost, aBrowser, aLocation) {
    	for(let entry of HANDLER_MAPPING) {
    		if(!entry.key.test(aHost))
    			continue;
    		
			let constructor = entry.value;
			let factoryFunction =  constructor.bind.apply(constructor, [ aBrowser ]);
   				
			let handler = new factoryFunction(aBrowser);
		    self.handlers.put(aBrowser.contentDocument, handler);
    	}
    };
    
    self.unregisterHandlers = function(aDocument) {
		for(let handler of self.handlers.removeAll(aDocument))
			handler.cleanup();
    };
    
    self.onPageUnload = function(aEvent) {
		dump("cleanup on page unload\n");
    	
	    self.unregisterHandlers(aEvent.target);
	};
	
	self.onTabClose = function(aEvent) {
		dump("cleanup on tab close\n");
		
		let tab = aEvent.target;
		let browser = gBrowser.getBrowserForTab(tab);
		
	    self.unregisterHandlers(browser.contentDocument);
	};
	
	self.onWindowClose = function(aEvent) {
		let window = aEvent.target;
		
		for(let browser of aWindow.gBrowser.browsers)
		    self.unregisterHandlers(browser.contentDocument);
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
	
	self.setupWindow = function(aWindow) {
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
		});
		
		aWindow.addEventListener("unload", function() {
			aWindow.gBrowser.removeTabsProgressListener(self);
			aWindow.removeEventListener('unload', self.onWindowClose);

			let tabContainer = aWindow.gBrowser.tabContainer;
	        tabContainer.removeEventListener("TabClose", self.onTabClose);
		});
	};
};