if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

com.sppad.BeQuiet.Handler = function(aBrowser, aSub) {
	
	let self = this;
	this.browser = aBrowser;
	this.doc = aBrowser.contentDocument;
	
	this.sub = aSub;
	this.initialized = false;
	
	this.onPlay = function(source) {
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_play', true, true);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
	
	this.onPause = function(source) {
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_pause', true, true);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
	
	this.setup = function() {
		self.initialized = self.sub.initialize();
		
		if(!self.initialized)
			return;
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		self.sub.registerListeners();
		
		if(self.sub.isPlaying())
			self.onPlay();
	};
	
	this.cleanup = function() {
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		if(!self.sub.initialized)
			return;
		
		self.sub.unregisterListeners();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
}