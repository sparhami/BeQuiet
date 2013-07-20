"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/SiteFilter.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

/**
 * A generic web-page handler.
 * 
 * @param aBrowser The browser object the handler handles
 * @param aImplementation An object with the following functions:
 * <ul>
 * <li>isLiked
 * <li>isPlaying
 * <li>getTrackInfo
 * <li>hasMedia
 * <li>pause
 * <li>play
 * <li>previous
 * <li>next
 * <li>like
 * <li>initialize
 * <li>registerListeners
 * <li>unregisterListeners
 * </ul>
 */
BeQuiet.Handler = function(aBrowser, aImplementation) {
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	self.browser = aBrowser;
	self.doc = aBrowser.contentDocument;
	
	self.implementation = aImplementation;
	self.initialized = false;
	self.playing = undefined;
	self.lastPlayTime = 0;
	
	self.pauseCheckTimer = null;
	
	self.observers = new Set();
	
	self.isActive = function() {
		return self.implementation.hasMedia();
	};
	
	self.getLastPlayTime = function() {
		return self.lastPlayTime;
	};
	
	self.onPlay = function() {
		BeQuiet.SiteFilter.checkPermission(self.browser, function() {
			self.handlePlay();
    	}, true);
	};
	
	self.onPause = function() {
		/*
		 * Guard against brief pauses (e.g. changing video location). Can't rely
		 * on seeking state since it is not available for all sites (e.g.
		 * YouTube Flash videos)
		 */
		clearTimeout(self.pauseCheckTimer);
		self.pauseCheckTimer = setTimeout(function() { 
			self.handlePause();
		}, Math.max(prefs.pauseCheckDelay, 1));
	};
	
	self.mediaInfoChanged = function() {
		self.createEvent('com_sppad_handler_mediaInfo');
	};
	
	self.handlePlay = function() {
		clearTimeout(self.pauseCheckTimer);
		
		if(self.playing === true)
			return;
		
		self.lastPlayTime = Date.now();
		
		self.playing = true;
		self.createEvent('com_sppad_handler_play');
	};
	
	self.handlePause = function() {
		if(self.playing === false)
			return;
		
		self.playing = false;
		self.createEvent('com_sppad_handler_pause');
	};
	
	self.createEvent = function(eventName) {
		let document = aBrowser.ownerDocument;
		
		let evt = document.createEvent('Event');
		evt.initEvent(eventName, false, false);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
	
	self.updatePlayingState = function() {
		if(self.isPlaying())
			self.onPlay();
		else
			self.onPause();
	};
	
	self.addObserver = function(observer) {
		self.observers.add(observer);
	};
	
	self.removeObserver = function(observer) {
		self.observers.delete(observer);
	};
	
	self.setup = function() {
		self.initialized = self.implementation.initialize();
		
		if(!self.initialized)
			return;
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		self.implementation.registerListeners();
		
		self.updatePlayingState();
	};
	
	self.cleanup = function() {
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		if(!self.initialized)
			return;
		
		self.implementation.unregisterListeners();
		
		clearTimeout(self.pauseCheckTimer);
		self.handlePause();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
};