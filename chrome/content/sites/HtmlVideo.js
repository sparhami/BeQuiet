if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.HtmlVideo = function(aBrowser) {
	
	let self = this;
	this.base = com.sppad.mediamaestro.Handler;
	this.base(aBrowser);
	
	this.isPlaying = function() {
		if(self.video == null)
			return false;
		
		return !self.video.paused;
	};
	
	this.play = function() {
		if(self.video == null)
			return;
		
		dump("playing html5\n");
		
		self.video.play();
	};
	
	this.pause = function() {
		if(self.video == null)
			return;
		
		dump("pausing html5\n");
		
		self.video.pause();
	};
	
	this.cleanup = function() {
		dump("cleaning up html5\n");
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		if(self.video == null)
			return;
		
		self.video.removeEventListener('play', self.onPlay);
		self.video.removeEventListener('pause', self.onPause);
	};
	
	this.setup = function(aEvent) {
		dump("looking for video tag\n");
		
		self.video = self.doc.getElementsByTagName('video')[0];
		
		if(self.video == null)
			return;
		
		dump("found video, setting up\n");
		
		self.browser.removeEventListener("DOMContentLoaded", self.setup);
		
		self.video.addEventListener('play', self.onPlay, true);
		self.video.addEventListener('pause', self.onPause, true);
			
		if(self.isPlaying())
			self.onPlay();
	};
	
	self.browser.addEventListener("DOMContentLoaded", self.setup, false);
	self.setup();
}

com.sppad.mediamaestro.HtmlVideo.prototype = Object.create(com.sppad.mediamaestro.Handler.prototype);
com.sppad.mediamaestro.HtmlVideo.prototype.constructor = com.sppad.mediamaestro.HtmlVideo;
