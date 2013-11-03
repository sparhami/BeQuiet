"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");

BeQuiet.MediaState = new function() {
	
	const observerService = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
	/** The handler that was playing, but was paused */
	self.pausedHandler = null;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
	
	/** Timer that delays resuming video per preference */
	self.resumeDelayTimer = null;
	
	self.paused = false;
	
    self.prefChanged = function(name, value) {
        switch(name) {
        	case 'enablePauseResume': 
        		value && self.forceOnePlayingHandler();
        		break;
        }
    };
    
    self.isPlaying = function() {
    	return self.playingHandler != null;
    };
    
	self.pause = function() {
		self.paused = true;
		
		let currentHandler = self.playingHandler;
  		self.pausedHandler = null;
		
		if(currentHandler != null)
			currentHandler.pause();
	};
	
	self.play = function() {
		self.paused = false;
		
		let handler = null;
		
		if(prefs.prioritizeCurrentTabForPlay)
			handler = self.getCurrentPageHandler();
		
		handler = handler || self.getLastHandler();
		
		if(handler != null)
			handler.play();
	};
	
	/**
	 * Switches to the tab for the currently playing handler.
	 */
	self.switchToTab = function() {
		let handler = self.playingHandler;
		
		if(!handler)
			return;
		
		handler.switchToTab();
	};
	
	self.getLastHandler = function() {
		let handler = BeQuiet.Iterable.from(BeQuiet.Main.getHandlers())
			.filter( a => a.isActive() )
			.max( (a, b) => a.getLastPlayTime() - b.getLastPlayTime() );
		
		return handler;
	};
	
	self.getCurrentPageHandler = function() {
		let handler = BeQuiet.Iterable.from(BeQuiet.Main.getHandlers())
			.filter( a => a.isActive() && BeQuiet.Main.handlesSelectedTab(a) )
			.max( (a, b) => a.getLastPlayTime() - b.getLastPlayTime() );
	
		return handler;
	};

	/**
	 * Pauses all handlers except for the most recently started currently
	 * playing handler.
	 */
	self.forceOnePlayingHandler = function() {
		let lastStartedHandler = BeQuiet.Iterable.from(BeQuiet.Main.getHandlers())
			.filter( a => a.isPlaying() )
			.max( (a, b) => a.getLastPlayTime() - b.getLastPlayTime() );
	
		for(let handler of BeQuiet.Main.getHandlers())
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
		clearTimeout(self.resumeDelayTimer);
		self.resumeDelayTimer = setTimeout(function() {
			if(self.pausedHandler != null)
	    		self.pausedHandler.play();
		}, Math.max(prefs.resumeDelay - prefs.pauseCheckDelay, 1));
	};

	self.onPause = function(aHandler) {
    	if(!prefs.enablePauseResume)
    		return;
    	
    	// Paused due to onPlay, ignore it
    	if(aHandler != self.playingHandler)
			return;
    	
       	self.playingHandler = null;

    	observerService.notifyObservers(null, 'com_sppad_BeQuiet_mediaState', 'pause');
    	
	  	if(!self.paused)
	  		self.resume();
    };
    
    self.onPlay = function(aHandler) {
    	if(!prefs.enablePauseResume)
    		return;
    	
		self.paused = false;
    	
    	clearTimeout(self.resumeDelayTimer);
    	
		self.pausedHandler = self.playingHandler;
		self.playingHandler = aHandler;
    	
    	if(self.pausedHandler != null)
    		self.pausedHandler.pause();
    	
    	observerService.notifyObservers(null, 'com_sppad_BeQuiet_mediaState', 'play');
    };
    
    self.onMediaInfoChanged = function(aHandler) {
    	if(aHandler !== self.playingHandler)
    		return;
    	
    	observerService.notifyObservers(null, 'com_sppad_BeQuiet_mediaTrackInfo', null);
    };
    
    self.onMediaRatingChanged = function(aHandler) {
    	if(aHandler !== self.playingHandler)
    		return;
    	
    	observerService.notifyObservers(null, 'com_sppad_BeQuiet_mediaTrackRating', null);
    };
	
	BeQuiet.Main.addObserver(self);
 	BeQuiet.Preferences.addPreferenceObserver(self);
};