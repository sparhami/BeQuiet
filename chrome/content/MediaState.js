com.sppad.BeQuiet.MediaState = new function() {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	
	let self = this;
	
	/** The handler that was playing, but was paused */
	self.pausedHandler = null;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
	
	/** Timer that delays resuming video per preference */
	self.resumeDelayTimer = null;
    
	self.pause = function() {
		let currentHandler = self.playingHandler;
		self.playingHandler = null;
  		self.pausedHandler = null;
		
		if(currentHandler != null)
			currentHandler.pause();

	  	self.firePauseEvent();
	};
	
	self.play = function() {
		let handler = null;
		
		if(prefs.prioritizeCurrentTabForPlay)
			handler = self.getCurrentPageHandler();
		
		handler = handler || self.getLastHandler();
		
		if(handler != null)
			handler.play();
	};
	
	self.getLastHandler = function() {
		let handler = com.sppad.collect.Iterable.from(com.sppad.BeQuiet.Main.handlers.values())
			.filter(function(a) { return a.isActive(); })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime(); });
		
		return handler;
	};
	
	self.getCurrentPageHandler = function() {
		let handler = com.sppad.collect.Iterable.from(com.sppad.BeQuiet.Main.handlers.values())
			.filter(function(a) { return a.isActive() && com.sppad.BeQuiet.Main.handlesSelectedTab(a); })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime(); });
	
		return handler;
	};

	/**
	 * Pauses all handlers except for the most recently started currently
	 * playing handler.
	 */
	self.forceOnePlayingHandler = function() {
		let lastStartedHandler = com.sppad.collect.Iterable.from(com.sppad.BeQuiet.Main.handlers.values())
			.filter(function(a) { return a.isPlaying(); })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime(); });
	
		for(let handler of com.sppad.BeQuiet.Main.handlers.values())
			if(handler !== lastStartedHandler)
				handler.pause();
	};
	
	self.next = function() {
		if(self.playingHandler)
			self.playingHandler.next();
	};
	
	self.previous = function() {
		if(self.playingHandler)
			self.playingHandler.previous();
	};
	
	self.resume = function() {
		window.clearTimeout(self.resumeDelayTimer);
		self.resumeDelayTimer = window.setTimeout(function() {
			if(self.pausedHandler != null)
	    		self.pausedHandler.play();
		}, prefs.resumeDelay - prefs.pauseCheckDleay);
	};

	self.firePlayEvent = function() {
    	let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_play', false, false);
		document.dispatchEvent(evt);
	};
	
	self.firePauseEvent = function() {
    	let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_pause', false, false);
		document.dispatchEvent(evt);
	};
	
	self.onPause = function(aEvent) {
    	if(!prefs.enablePauseResume)
    		return;
    	
    	let handler = aEvent.handler;
    	
    	// Paused due to onPlay or pause, ignore it
    	if(handler != self.playingHandler)
			return;
    	
       	self.playingHandler = null;
	  	self.firePauseEvent();       	
       	
       	self.resume();
    };
    
    self.onPlay = function(aEvent) {
    	if(!prefs.enablePauseResume)
    		return;
    	
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


