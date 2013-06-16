com.sppad.BeQuiet.MediaState = new function() {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	
	let self = this;
	
	/** The handler that was playing, but was paused */
	self.pausedHandler = null;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
	
	/** Timer that delays resuming video per preference */
	self.resumeDelayTimer = null;
    
	this.pause = function() {
		let currentHandler = self.playingHandler;
		self.playingHandler = null;
  		self.pausedHandler = null;
		
		if(currentHandler != null)
			currentHandler.pause();

	  	self.firePauseEvent();
	};
	
	this.play = function() {
		let handler = null;
		
		if(prefs.prioritizeCurrentTabForPlay)
			handler = self.getCurrentPageHandler();
		
		handler = handler || self.getLastHandler();
		
		if(handler != null)
			handler.play();
	};
	
	this.getLastHandler = function() {
		let handler = com.sppad.collect.Iterable.from(com.sppad.BeQuiet.Main.handlers.values())
			.filter(function(a) { return a.isActive() })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime() });
		
		return handler;
	};
	
	this.getCurrentPageHandler = function() {
		let handler = com.sppad.collect.Iterable.from(com.sppad.BeQuiet.Main.handlers.values())
			.filter(function(a) { return a.isActive() && com.sppad.BeQuiet.Main.handlesSelectedTab(a) })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime() });
	
		return handler;
	};
	
	this.next = function() {
		if(self.playingHandler)
			self.playingHandler.next();
	};
	
	this.previous = function() {
		if(self.playingHandler)
			self.playingHandler.previous();
	};
	
	this.resume = function() {
		window.clearTimeout(self.resumeDelayTimer);
		self.resumeDelayTimer = window.setTimeout(function() {
			if(self.pausedHandler != null)
	    		self.pausedHandler.play();
		}, prefs.resumeDelay - prefs.pauseCheckDleay);
	};

	this.firePlayEvent = function() {
    	let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_play', false, false);
		document.dispatchEvent(evt);
	};
	
	this.firePauseEvent = function() {
    	let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_pause', false, false);
		document.dispatchEvent(evt);
	};
	
    this.onPause = function(aEvent) {
    	let handler = aEvent.handler;
    	
    	// Paused due to onPlay or pause, ignore it
    	if(handler != self.playingHandler)
			return;
    	
       	self.playingHandler = null;
	  	self.firePauseEvent();       	
       	
       	self.resume();
    };
    
    this.onPlay = function(aEvent) {
    	window.clearTimeout(self.resumeDelayTimer);
    	
    	let handler = aEvent.handler;
    	
		self.pausedHandler = self.playingHandler;
		self.playingHandler = handler;
    	
    	if(self.pausedHandler != null)
    		self.pausedHandler.pause();
		
      	self.firePlayEvent();
    };
    
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_handler_play", self.onPlay, false);
		document.addEventListener("com_sppad_handler_pause", self.onPause, false);
	});
};


