com.sppad.BeQuiet.EightTracks = function(aBrowser) {
	
	const PLAY_ACTIVE = /display: none;/;
	
	let self = this;
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		let value = self.playButton.getAttribute('style');
		return PLAY_ACTIVE.test(value);
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
	
	self.playObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.attributeName != 'style')
            	return;
            
            window.setTimeout(function() {
        		self.updatePlayingState();
            }, 1);
        });   
    });
	
	self.initialize = function() {
		self.playButton = self.doc.getElementById('player_play_button');
		self.pauseButton = self.doc.getElementById('player_pause_button');
		self.nextButton = self.doc.getElementById('player_skip_button');
		
		return self.playButton != null &&  self.pauseButton != null;
	};
	
	self.registerListeners = function() {
	    self.playObserver.observe(self.playButton, { attributes: true });
	};
	
	self.unregisterListeners = function() {
		self.playObserver.disconnect();
	};
	
	self.base = com.sppad.BeQuiet.Handler;
	self.base(aBrowser, self);
}

com.sppad.BeQuiet.EightTracks.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.EightTracks.prototype.constructor = com.sppad.BeQuiet.EightTracks;