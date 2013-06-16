/**
 * A generic web-page handler.
 * 
 * @param aBrowser The browser object the handler handles
 * @param aImplementation An object with the following functions:
 * <ul>
 * <li>isActive
 * <li>isPlaying
 * <li>play
 * <li>pause
 * <li>next
 * <li>previous
 * <li>initialize
 * <li>registerListeners
 * <li>unregisterListeners
 * </ul>
 */
com.sppad.BeQuiet.Handler = function(aBrowser, aImplementation) {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	
	let self = this;
	this.browser = aBrowser;
	this.doc = aBrowser.contentDocument;
	
	this.implementation = aImplementation;
	this.initialized = false;
	this.playing = undefined;
	this.lastPlayTime = 0;
	
	this.pauseCheckTimer = null;
	
	this.getLastPlayTime = function() {
		return self.lastPlayTime;
	};
	
	this.onPlay = function() {
		if(self.playing === true)
			return;
		
		self.playing = true;
		self.lastPlayTime = Date.now();
			
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_handler_play', false, false);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
	
	this.onPause = function() {
		// Guard against brief pauses (e.g. changing video location)
		window.clearTimeout(self.pauseCheckTimer);
		self.pauseCheckTimer = window.setTimeout(function() {
			if(self.playing === false)
				return;
			
			if(self.implementation.isPlaying())
				return;
		
			self.playing = false;
			
			let evt = document.createEvent('Event');
			evt.initEvent('com_sppad_handler_pause', false, false);
			evt.handler = self;
			
			document.dispatchEvent(evt);
		}, prefs.pauseCheckDelay);
	};
	
	this.updatePlayingState = function() {
		if(self.isPlaying())
			self.onPlay();
		else
			self.onPause();
	};
	
	this.setup = function() {
		self.initialized = self.implementation.initialize();
		
		if(!self.initialized)
			return;
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		self.implementation.registerListeners();
		
		self.updatePlayingState();
	};
	
	this.cleanup = function() {
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		if(!self.implementation.initialized)
			return;
		
		self.implementation.unregisterListeners();
		
		if(self.implementation.isPlaying())
			self.onPause();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
}