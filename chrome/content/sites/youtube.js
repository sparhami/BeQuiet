if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.YouTube = function(aBrowser) {
	
	let self = this;
	
	self.browser = aBrowser;
	self.doc = aBrowser.contentDocument;
	
	this.isPlaying = function() {
		if(self.video == null)
			return false;
		
		return !self.video.paused;
	};
	
	this.play = function() {
		if(self.video == null)
			return;
		
		self.video.play();
	};
	
	this.pause = function() {
		if(self.video == null)
			return;
		
		self.video.play();
	};
	
	this.cleanup = function() {
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		if(self.video == null)
			return;
		
		self.video.removeEventListener('play', self.onPlay);
		self.video.removeEventListener('pause', self.onPause);
	};
	
	this.onPlay = function() {
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_play', true, true);
		evt.browser = self.browser;
		
		document.dispatchEvent(evt);
	};
	
	this.onPause = function() {
		let evt = document.createEvent('Event');
		evt.initEvent('com_sppad_media_pause', true, true);
		evt.browser = self.browser;
		
		document.dispatchEvent(evt);
	};
	
	this.setup = function(aEvent) {
		self.video = self.doc.getElementsByTagName('video')[0];
		
		if(self.video == null)
			return;
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		self.video.addEventListener('play', self.onPlay, true);
		self.video.addEventListener('pause', self.onPause, true);
		
		if(self.isPlaying())
			self.onPlay();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
}

