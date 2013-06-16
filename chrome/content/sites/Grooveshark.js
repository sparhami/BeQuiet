com.sppad.BeQuiet.Grooveshark = function(aBrowser) {
	
	const PLAYING_CLASS = 'playing';
	
	let self = this;
	
	self.isActive = function() {
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
        	
            window.setTimeout(function() {
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

com.sppad.BeQuiet.Grooveshark.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.Grooveshark.prototype.constructor = com.sppad.BeQuiet.Grooveshark;