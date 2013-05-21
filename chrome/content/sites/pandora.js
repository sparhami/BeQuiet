if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.Pandora = function(aBrowser) {
	
	let self = this;
	
	self.browser = aBrowser;
	self.doc = aBrowser.contentDocument;
	
	this.isPlaying = function() {
		
	   let style = self.playButton.getAttribute('style');
           
       return !/display: none;/.test(style);
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
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		self.playButtonObserver.disconnect();
	};
	
	this.onPlay = function() {
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_play', true, true);
		evt.handler = self;
		
		document.dispatchEvent(evt);
	};
	
	this.onPause = function() {
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_pause', true, true);
		evt.handler = self;
		
		document.dispatchEvent(evt);
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
		self.playButton = self.doc.getElementsByClassName('playButton')[0];
		self.pauseButton = self.doc.getElementsByClassName('pauseButton')[0];
		
		if(!self.playButton || !self.pauseButton)
			return;
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
	    self.playButtonObserver.observe(self.playButton, { attributes: true });
		
		if(self.isPlaying())
			self.onPlay();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
}

