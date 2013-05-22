if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

com.sppad.BeQuiet.Pandora = function(aBrowser) {
	
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
	
	this.playObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.attributeName != 'style')
            	return;
            
            window.setTimeout(function() {
            	if(self.isPlaying())
            		self.onPlay();
            	else
                   	self.onPause();
            }, 1);
        });   
    });
	
	this.initialize = function() {
		self.playButton = self.doc.getElementsByClassName('playButton')[0];
		self.pauseButton = self.doc.getElementsByClassName('pauseButton')[0];
		
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

com.sppad.BeQuiet.Pandora.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.Pandora.prototype.constructor = com.sppad.BeQuiet.Pandora;