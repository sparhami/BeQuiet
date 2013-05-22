if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.LastFM = function(aBrowser) {
	
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
		
		dump("playing last.fm\n");
		
		self.playButton.click();
	};
	
	this.pause = function() {
		if(!self.initialized)
			return;
		
		dump("pausing last.fm\n");
		
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
	
	this.base = com.sppad.mediamaestro.Handler;
	this.base(aBrowser, self);
}

com.sppad.mediamaestro.LastFM.prototype = Object.create(com.sppad.mediamaestro.Handler.prototype);
com.sppad.mediamaestro.LastFM.prototype.constructor = com.sppad.mediamaestro.LastFM;