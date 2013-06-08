com.sppad.BeQuiet.MediaState = new function() {
	
	let self = this;
	
	/** The handler that was playing, but was paused */
	self.pausedHandler = null;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
    
    this.setPlayingHandler = function(aHandler) {
      	if(self.playingHandler != null)
    		self.playingHandler.pause();
		
		self.pausedHandler = self.playingHandler;
    	self.playingHandler = aHandler;
    };
	
	this.pause = function() {
		self.setPlayingHandler(null);
	  	self.firePauseEvent();
	};
	
	this.play = function() {
		let lastPlayTime = -1;
		let lastPlayingHandler = null;

		for(let handler of com.sppad.BeQuiet.Main.handlers.values()) {
			if(handler.isActive() && handler.getLastPlayTime() >= lastPlayTime) {
				lastPlayTime = handler.getLastPlayTime();
				lastPlayingHandler = handler;
			}
		}
		
		if(lastPlayingHandler != null)
			lastPlayingHandler.play();
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
		if(self.pausedHandler != null)
    		self.pausedHandler.play();
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
    	
    	// A handler has been paused due to onPlay, ignore it
    	if(handler != self.playingHandler)
			return;
    	
       	self.playingHandler = null;
	  	self.firePauseEvent();       	
       	
       	self.resume();
    };
    
    this.onPlay = function(aEvent) {
      	self.setPlayingHandler(aEvent.handler);
      	self.firePlayEvent();
    };
    
	window.addEventListener("load", function() {
		document.addEventListener("com_sppad_handler_play", self.onPlay, false);
		document.addEventListener("com_sppad_handler_pause", self.onPause, false);
	});
};


