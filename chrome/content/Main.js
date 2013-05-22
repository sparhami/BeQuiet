if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.id = 0;

com.sppad.mediamaestro.Main = new function() {
	
	const HANDLER_MAPPING = [ { key: /youtube.com$/, value: com.sppad.mediamaestro.HtmlVideo },
	                          { key: /sppad.com$/, value: com.sppad.mediamaestro.HtmlVideo },
	                          { key: /sppad.com$/, value: com.sppad.mediamaestro.Pandora },
	                          { key: /pandora.com$/, value: com.sppad.mediamaestro.Pandora } ];
	
	let self = this;

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
    	HANDLER_MAPPING.forEach(function(entry) {
   			try {
   				dump("checking " + aHost + " against " + entry.key + "\n");
   				
   	  			if(!entry.key.test(aHost))
   	  				return;
   	  			
  				dump("matched, creating handler for " + entry.key + "\n");
  				
   				let constructor = entry.value;
   				let factoryFunction =  constructor.bind.apply(constructor, [ aBrowser ]);
   				
   				let handler = new factoryFunction(aBrowser);
   			    self.handlers.put(aBrowser.contentDocument, handler);
   			} catch(err) {
   				dump("error: " + err + "\n");
   				dump(err.stack);
   			}
   		});
    };
    
	this.onPageUnload = function(aEvent) {
		let doc = aEvent.originalTarget;
	    
		for(let handler of self.handlers.get(doc))
			handler.cleanup();

		self.handlers.removeAll(doc);
	};
    
    this.pauseOther = function(obj) {
    	for (let value of self.handlers.values())
    		if(value !== obj)
    			value.pause();
    };
    
    this.onPause = function(aEvent) {
		dump("media onPause\n");
    };
    
    this.onPlay = function(aEvent) {
		dump("media onPlay\n");
		
		self.pauseOther(aEvent.handler);
    };
    
	window.addEventListener("load", function() {
		gBrowser.addTabsProgressListener(self);
		
		document.addEventListener("com_sppad_media_play", self.onPlay, false);
		document.addEventListener("com_sppad_media_pause", self.onPause, false);
	});
	
};


