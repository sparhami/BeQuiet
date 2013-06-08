com.sppad.BeQuiet.Playlist = function(aBrowser) {
	
	const PLAY_ACTIVE = /display: none;/;
	
	let self = this;
	
	this.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		let value = self.playButton.getAttribute('style');
		return PLAY_ACTIVE.test(value);
	};
	
	this.play = function() {
		if(!self.initialized)
			return;
		
		self.playButton.click();
	};
	
	this.pause = function() {
		if(!self.initialized)
			return;
		
		self.pauseButton.click();
	};
	
	this.next = function() {
		if(!self.initialized)
			return;
		
		self.nextButton.click();
	};
	
	this.previous = function() {
		if(!self.initialized)
			return;
		
		self.prevButton.click();
	};
	
	this.playObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.attributeName != 'style')
            	return;
            
            window.setTimeout(function() {
        		self.updatePlayingState();
            }, 1);
        });   
    });
	
	this.initialize = function() {
		self.playButton = self.doc.getElementsByClassName('jp-play')[0];
		self.pauseButton = self.doc.getElementsByClassName('jp-pause')[0];
		self.nextButton = self.doc.getElementsByClassName('jp-next')[0];
		self.prevButton = self.doc.getElementsByClassName('jp-prev')[0];
		
		return self.playButton != null &&  self.pauseButton != null;
	};
	
	this.registerListeners = function() {
	    self.playObserver.observe(self.playButton, { attributes: true });
	};
	
	this.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	this.base = com.sppad.BeQuiet.Handler;
	this.base(aBrowser, self);
}

com.sppad.BeQuiet.Playlist.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.Playlist.prototype.constructor = com.sppad.BeQuiet.Playlist;