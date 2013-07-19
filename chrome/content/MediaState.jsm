"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");

BeQuiet.MediaState = new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
	/** The handler that was playing, but was paused */
	self.pausedHandler = null;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
	
	/** Timer that delays resuming video per preference */
	self.resumeDelayTimer = null;
	
	self.observers = new Set();
	
	self.paused = false;
	
    self.prefChanged = function(name, value) {
        switch(name) {
        	case 'enablePauseResume': 
        		value && self.forceOnePlayingHandler();
        		break;
        }
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
	
	self.getLastHandler = function() {
		let handler = BeQuiet.Iterable.from(BeQuiet.Main.getHandlers())
			.filter(function(a) { return a.isActive(); })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime(); });
		
		return handler;
	};
	
	self.getCurrentPageHandler = function() {
		let handler = BeQuiet.Iterable.from(BeQuiet.Main.getHandlers())
			.filter(function(a) { return a.isActive() && BeQuiet.Main.handlesSelectedTab(a); })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime(); });
	
		return handler;
	};

	/**
	 * Pauses all handlers except for the most recently started currently
	 * playing handler.
	 */
	self.forceOnePlayingHandler = function() {
		let lastStartedHandler = BeQuiet.Iterable.from(BeQuiet.Main.getHandlers())
			.filter(function(a) { return a.isPlaying(); })
			.max(function(a, b) { return a.getLastPlayTime() - b.getLastPlayTime(); });
	
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

    	for(let observer of self.observers)
			observer.onPause(aHandler);
    	
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
    	
		for(let observer of self.observers)
			observer.onPlay(aHandler);
    };
    
    self.onMediaInfoChanged = function(aHandler) {
    	dump("MediaState onMediaInfoChanged\n");
    	if(aHandler !== self.playingHandler)
    		return;
    	
    	for(let observer of self.observers)
			observer.onMediaInfoChanged(aHandler);
    };
    
	self.addObserver = function(observer) {
		self.observers.add(observer);
	};
	
	self.removeObserver = function(observer) {
		self.observers.delete(observer);
	};
	
	BeQuiet.Main.addObserver(self);
 	BeQuiet.Preferences.addObserver(self);
};