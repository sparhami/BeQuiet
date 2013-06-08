com.sppad.BeQuiet.Grooveshark = function(aBrowser) {
	
	const PLAYING_CLASS = 'playing';
	
	let self = this;
	
	this.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return self.button.classList.contains(PLAYING_CLASS);
	};
	
	
	this.play = function() {
		if(!self.initialized)
			return;
		
		if(!self.isPlaying())
			self.button.click();
	};
	
	this.pause = function() {
		if(!self.initialized)
			return;
		
		if(self.isPlaying())
			self.button.click();
	};
	
	this.next = function() {
		if(!self.initialized)
			return;
		
		if(self.isPlaying())
			self.nextButton.click();
	};
	
	this.previous = function() {
		if(!self.initialized)
			return;
		
		self.prevButton.click();
	};
	
	this.playObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.attributeName != 'class')
            	return;
        	
            window.setTimeout(function() {
        		self.updatePlayingState();
            }, 1);
        });   
    });
	
	this.initialize = function() {
		self.button = self.doc.getElementById('play-pause');
		self.nextButton = self.doc.getElementById('play-next');
		self.prevButton = self.doc.getElementById('play-prev');
		
		return self.button != null;
	};
	
	this.registerListeners = function() {
	    self.playObserver.observe(self.button, { attributes: true });
	};
	
	this.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	this.base = com.sppad.BeQuiet.Handler;
	this.base(aBrowser, self);
}

com.sppad.BeQuiet.Grooveshark.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.Grooveshark.prototype.constructor = com.sppad.BeQuiet.Grooveshark;