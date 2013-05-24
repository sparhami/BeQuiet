if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

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
	
	/** A handler that was playing, but was paused due to another starting */
	self.lastPlayingHandler = null;
	
	/** Used to prevent a loop when a video is paused */
	self.pausingOtherVideos = false;
    
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
    
    this.pauseOther = function(obj) {
    	for (let handler of self.handlers.values()) {
    		if(handler === obj)
    			continue;
    		
    		if(handler.isPlaying())
    			self.lastPlaying = handler;
    		
    		handler.pause();
    	}
    };
    
    this.resumeLast = function() {
    	if(self.lastPlaying != null)
    		self.lastPlaying.play();
    	
    	self.lastPlaying = null;
    };
    
    this.onPause = function(aEvent) {
		// Make sure being paused due to a play doesn't resume the paused video
		if(self.pausingOtherVideos)
			return;
		
		self.resumeLast();
    };
    
    this.onPlay = function(aEvent) {
		self.pausingOtherVideos = true;
		self.pauseOther(aEvent.handler);
		
		/*
		 * Give enough time for paused handlers to go through onPause, for Flash
		 * sites that check a DOM node's attributes/class.
		 */
		window.setTimeout(function() {
			self.pausingOtherVideos = false;
		}, 200);
    };
    
	window.addEventListener("load", function() {
		gBrowser.addTabsProgressListener(self);
		
		document.addEventListener("com_sppad_media_play", self.onPlay, false);
		document.addEventListener("com_sppad_media_pause", self.onPause, false);
	});
};


