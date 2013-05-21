if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.Pandora = function(aDocument) {
	
	let self = this;
	
	self.doc = aDocument;
	
	this.isPlaying = function() {
		return false;
	};
	
	this.play = function() {
		self.playButton.click();
	};
	
	this.pause = function() {
		dump("pausing pandora\n");
		
		self.pauseButton.click();
	};
	
	this.cleanup = function() {
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
                let style = mutation.target.getAttribute('style');
                
                dump("style is " + style + "\n");
                
                if(/display: none;/.test(style))
                	self.onPlay();
                else
                	self.onPause();
            }
        });   
    });
	
	this.setup = function() {
		self.playButton = self.doc.getElementsByClassName('playButton')[0].click();
		self.pauseButton = self.doc.getElementsByClassName('pauseButton')[0].click();
		
	    self.playButtonObserver.observe(self.playButton, { attributes: true });
		
		if(self.isPlaying())
			self.onPlay();
	};
	
	this.setup();
}

