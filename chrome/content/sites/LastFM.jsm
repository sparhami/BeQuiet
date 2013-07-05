var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.LastFM = function(aBrowser) {
	
	const PLAYING_CLASS = 'playing';
	
	let self = this;
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return self.webRadio.classList.contains(PLAYING_CLASS);
	};
	
	self.play = function() {
		if(!self.initialized)
			return;
		
		self.playButton.click();
	};
	
	self.pause = function() {
		if(!self.initialized)
			return;
		
		self.pauseButton.click();
	};
	
	self.next = function() {
		if(!self.initialized)
			return;
		
		self.nextButton.click();
	};
	
	self.previous = function() {

	};
	
	self.initialize = function() {
		self.webRadio = self.doc.getElementById('webRadio');
		self.playButton = self.doc.getElementById('radioControlPlay');
		self.pauseButton = self.doc.getElementById('radioControlPause');
		self.nextButton = self.doc.getElementById('radioControlSkip');
		
		return (self.webRadio != null) && (self.playButton != null) && (self.pauseButton != null);
	};
	
	self.registerListeners = function() {
		self.playObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	            if(mutation.attributeName != 'class')
	            	return;
	        	
	            setTimeout(function() {
	        		self.updatePlayingState();
	            }, 1);
	        });   
	    });
	    self.playObserver.observe(self.webRadio, { attributes: true });
	};
	
	self.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
}

BeQuiet.LastFM.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.LastFM.prototype.constructor = BeQuiet.LastFM;