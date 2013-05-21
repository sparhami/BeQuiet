if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.id = 0;

com.sppad.mediamaestro.Main = new function() {
	
	const HANDLER_MAPPING = [ { key: 'youtube.com', value: com.sppad.mediamaestro.YouTube },
	                          { key: 'pandora.com', value: com.sppad.mediamaestro.Pandora } ];
	
	let self = this;

	self.registered = Array();
	self.handlers = new Map();
    
    this.onLocationChange = function(aBrowser, aWebProgress, aRequest, aLocation) {
    	dump("location change to " + aLocation.asciiSpec + "\n");
   		
    	let doc = aBrowser.contentDocument;
		let win = doc.defaultView;
	    let host = doc.location.host;
		
	    if(!host)
	    	return;
	    
		if(self.handlers.has(doc))
			return;
	    
	    win.addEventListener('unload', self.onPageUnload, false);
	    
		dump("loading handler\n");
	    
		HANDLER_MAPPING.forEach(function(entry) {
   			try {
	   			dump("checking " + host + " against " + entry.key + "\n");
	   			
	   			if(host.endsWith(entry.key)) {
	   				let constructor = entry.value;
	   				let factoryFunction =  constructor.bind.apply(constructor, [ aBrowser ]);
	   				
	   				let handler = new factoryFunction(aBrowser);
	   				self.register(handler);
	   			    self.handlers.set(doc, handler);
	   				
	   	    		dump("done setting up\n");
	   			}
   			} catch(err) {
   				dump("error: " + err + "\n");
   			}
   		});
    };
    
	this.onPageUnload = function(aEvent) {
		let doc = aEvent.originalTarget;
	    let host = doc.location.host;

		let handler =  self.handlers.get(doc);
	    
		if(!handler)
			return;
		
		dump("unloading handler\n");
		
		self.handlers.delete(doc);
		self.unregister(handler);
		handler.cleanup();
		
		dump("done unregistering\n");
	};
	
    this.register = function(obj) {
    	self.registered.push(obj);
    };
    
    this.unregister = function(obj) {
    	for(let i = 0; i < self.registered.length; i++)
			if (self.registered[i] === obj)
				self.registered.splice(i, 1);
    };
    
    this.pauseOther = function(obj) {
    	self.registered.forEach(function(item) {
    		if(item !== obj) {
    			item.pause();
    		}
    	});
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


