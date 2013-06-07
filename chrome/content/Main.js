com.sppad.BeQuiet.Main = new function() {
	
	/**
	 * Maps regular expressions to the handlers for that site. A site can have
	 * more than one handler (e.g. YouTube, one for Flash and one for Hmtl5).
	 */
	const HANDLER_MAPPING = [ { key: /youtube.com$/, value: com.sppad.BeQuiet.YouTube },
	                          { key: /pandora.com$/, value: com.sppad.BeQuiet.Pandora },
	                          { key: /last.fm$/, value: com.sppad.BeQuiet.LastFM },
	                          { key: new RegExp("."), value: com.sppad.BeQuiet.HtmlVideo } ];
	
	let self = this;

	/** Maps documents to the handlers for that document */
	self.handlers = new com.sppad.collect.SetMultiMap();
	
    this.onLocationChange = function(aBrowser, aWebProgress, aRequest, aLocation) {
    	let doc = aBrowser.contentDocument;
		let win = doc.defaultView;
	    let host = doc.location.host;
		
	    if(!host)
	    	return;
	    
		if(self.handlers.containsKey(doc))
			return;
	    
	    win.addEventListener('unload', self.onPageUnload, false);
	    
		self.registerHandlers(host, aBrowser);
    };
    
    this.registerHandlers = function(aHost, aBrowser) {
    	for(let entry of HANDLER_MAPPING) {
    		if(!entry.key.test(aHost))
    			continue;
    		
			let constructor = entry.value;
			let factoryFunction =  constructor.bind.apply(constructor, [ aBrowser ]);
   				
			let handler = new factoryFunction(aBrowser);
		    self.handlers.put(aBrowser.contentDocument, handler);
    	}
    };
    
    this.unregisterHandlers = function(aDocument) {
		for(let handler of self.handlers.get(aDocument))
			handler.cleanup();

		self.handlers.removeAll(aDocument);
    };
    
	this.onPageUnload = function(aEvent) {
	    self.unregisterHandlers(aEvent.originalTarget);
	};

	window.addEventListener("load", function() {
		gBrowser.addTabsProgressListener(self);
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
