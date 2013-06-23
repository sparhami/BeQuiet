Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm", com.sppad.BeQuiet);
Components.utils.import("chrome://BeQuiet/content/collect/SetMultiMap.jsm", com.sppad.BeQuiet);

com.sppad.BeQuiet.Main = new function() {
	
	/**
	 * Maps regular expressions to the handlers for that site. A site can have
	 * more than one handler (e.g. YouTube, one for Flash and one for Hmtl5).
	 */
	const HANDLER_MAPPING = [ { key: /youtube.com$/, value: com.sppad.BeQuiet.YouTube },
	                          { key: /pandora.com$/, value: com.sppad.BeQuiet.Pandora },
	                          { key: /last.fm$/, value: com.sppad.BeQuiet.LastFM },
	                          { key: /grooveshark.com$/, value: com.sppad.BeQuiet.Grooveshark },
	                          { key: /playlist.com$/, value: com.sppad.BeQuiet.Playlist },
	                          { key: /8tracks.com$/, value: com.sppad.BeQuiet.EightTracks },
	                          { key: new RegExp("."), value: com.sppad.BeQuiet.HtmlVideo } ];
	
	let self = this;

	/** Maps documents to the handlers for that document */
	self.handlers = new com.sppad.BeQuiet.SetMultiMap();
	
	self.onLocationChange = function(aBrowser, aWebProgress, aRequest, aLocation) {
    	let doc = aBrowser.contentDocument;
		let win = doc.defaultView;
	    let host = doc.location.host;
		
	    if(!host)
	    	return;
	    
		if(self.handlers.containsKey(doc))
			return;
		
	    win.addEventListener('unload', self.onPageUnload, false);
	    
		self.registerHandlers(host, aBrowser, aLocation);
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
	    self.unregisterHandlers(aEvent.originalTarget);
	};
	
	self.onTabClose = function(aEvent) {
		let tab = aEvent.target;
		let browser = gBrowser.getBrowserForTab(tab);
		
	    self.unregisterHandlers(browser.contentDocument);
	};
	
	self.getTabForBrowser = function(aBrowser) {
		return com.sppad.BeQuiet.Iterable.from(gBrowser.tabs)
			.filter(function(tab) { return gBrowser.getBrowserForTab(tab) === aBrowser })
			.first();
	};
	
	self.handlesSelectedTab = function(aHandler) {
		return self.getTabForBrowser(aHandler.browser) === gBrowser.selectedTab;
	};
	
	window.addEventListener("load", function() {
		gBrowser.addTabsProgressListener(self);

		let tabContainer = window.gBrowser.tabContainer;
        tabContainer.addEventListener("TabClose", self.onTabClose, true);
	});
	
	window.addEventListener("unload", function() {
		gBrowser.removeTabsProgressListener(self);

		let tabContainer = window.gBrowser.tabContainer;
        tabContainer.removeEventListener("TabClose", self.onTabClose);
	});
};

window.addEventListener("load", function() {
	Application.getExtensions(function (extensions) {
	    if (extensions.get("BeQuiet@com.sppad").firstRun) {
	        var toolbar = document.getElementById('nav-bar');
	
	        toolbar.insertItem('com_sppad_beQuiet_media_playPause', null);
	        toolbar.setAttribute("currentset", toolbar.currentSet);
	        document.persist(toolbar.id, "currentset");
	    }
	});
});
