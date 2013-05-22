if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.Pandora = function(aBrowser) {
	
	const PLAY_BUTTON_INACTIVE = /display: none;/;
	
	let self = this;
	this.base = com.sppad.mediamaestro.Handler;
	this.base(aBrowser);
	
	this.isPlaying = function() {
		
	   let style = self.playButton.getAttribute('style');
           
       return !PLAY_BUTTON_INACTIVE.test(style);
	};
	
	this.play = function() {
		dump("playing pandora\n");
		
		self.playButton.click();
	};
	
	this.pause = function() {
		dump("pausing pandora\n");
		
		self.pauseButton.click();
	};
	
	this.cleanup = function() {
		dump("cleaning up pandora\n");
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		self.playButtonObserver.disconnect();
	};
	
	this.playButtonObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.attributeName == 'style') {
                let playing = !self.isPlaying();
                
                if(playing)
                	self.onPlay();
                else
                	self.onPause();
            }
        });   
    });
	
	this.setup = function() {
		dump("looking for buttons\n");
		
		self.playButton = self.doc.getElementsByClassName('playButton')[0];
		self.pauseButton = self.doc.getElementsByClassName('pauseButton')[0];
		
		if(!self.playButton || !self.pauseButton)
			return;
		
		dump("found buttons, setting up\n");
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
	    self.playButtonObserver.observe(self.playButton, { attributes: true });
		
		if(self.isPlaying())
			self.onPlay();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
}

com.sppad.mediamaestro.Pandora.prototype = new com.sppad.mediamaestro.Handler;