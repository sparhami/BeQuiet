com.sppad.BeQuiet.LastFM = function(aBrowser) {
	
	const PLAYING_CLASS = 'playing';
	
	let self = this;
	
	this.isActive = function() {
		return self.initialized;
	};
	
	this.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return self.webRadio.classList.contains(PLAYING_CLASS);
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
		self.webRadio = self.doc.getElementById('webRadio');
		self.playButton = self.doc.getElementById('radioControlPlay');
		self.pauseButton = self.doc.getElementById('radioControlPause');
		self.nextButton = self.doc.getElementById('radioControlSkip');
		
		return (self.webRadio != null) && (self.playButton != null) && (self.pauseButton != null);
	};
	
	this.registerListeners = function() {
	    self.playObserver.observe(self.webRadio, { attributes: true });
	};
	
	this.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	this.base = com.sppad.BeQuiet.Handler;
	this.base(aBrowser, self);
}

com.sppad.BeQuiet.LastFM.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.LastFM.prototype.constructor = com.sppad.BeQuiet.LastFM;