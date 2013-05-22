if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.BeQuiet = com.sppad.BeQuiet || {};

com.sppad.BeQuiet.LastFM = function(aBrowser) {
	
	const PAUSED_CLASS = /paused/;
	
	let self = this;
	
	this.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		let value = self.webRadio.getAttribute('class');
		return !PAUSED_CLASS.test(value);
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
            if(mutation.attributeName != 'class')
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
		self.webRadio = self.doc.getElementById('webRadio');
		self.playButton = self.doc.getElementById('radioControlPlay');
		self.pauseButton = self.doc.getElementById('radioControlPause');
		
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