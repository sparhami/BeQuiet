var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

BeQuiet.Grooveshark = function(aBrowser) {
	
	const PLAYING_CLASS = 'playing';
	
	let self = this;
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return self.button.classList.contains(PLAYING_CLASS);
	};
	
	
	self.play = function() {
		if(!self.initialized)
			return;
		
		if(!self.isPlaying())
			self.button.click();
	};
	
	self.pause = function() {
		if(!self.initialized)
			return;
		
		if(self.isPlaying())
			self.button.click();
	};
	
	self.next = function() {
		if(!self.initialized)
			return;
		
		if(self.isPlaying())
			self.nextButton.click();
	};
	
	self.previous = function() {
		if(!self.initialized)
			return;
		
		self.prevButton.click();
	};
	
	self.playObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.attributeName != 'class')
            	return;
        	
            setTimeout(function() {
        		self.updatePlayingState();
            }, 1);
        });   
    });
	
	self.initialize = function() {
		self.button = self.doc.getElementById('play-pause');
		self.nextButton = self.doc.getElementById('play-next');
		self.prevButton = self.doc.getElementById('play-prev');
		
		return self.button != null;
	};
	
	self.registerListeners = function() {
	    self.playObserver.observe(self.button, { attributes: true });
	};
	
	self.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	self.base = com.sppad.BeQuiet.Handler;
	self.base(aBrowser, self);
}

BeQuiet.Grooveshark.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.Grooveshark.prototype.constructor = BeQuiet.Grooveshark;