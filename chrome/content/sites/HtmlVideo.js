if (typeof com == "undefined") {
  var com = {};
}

com.sppad = com.sppad || {};
com.sppad.mediamaestro = com.sppad.mediamaestro || {};

com.sppad.mediamaestro.HtmlVideo = function(aBrowser) {
	let self = this;
	
	this.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return !self.video.paused;
	};
	
	this.play = function() {
		if(!self.initialized)
			return;
		
		dump("playing html5\n");
		
		self.video.play();
	};
	
	this.pause = function() {
		if(!self.initialized)
			return;
		
		dump("pausing html5\n");
		
		self.video.pause();
	};
	
	this.initialize = function() {
		self.video = self.doc.getElementsByTagName('video')[0];
		
		return self.video != null;
	};
	
	this.registerListeners = function() {
		self.video.addEventListener('play', self.onPlay, true);
		self.video.addEventListener('pause', self.onPause, true);
	};
	
	this.unregisterListeners = function() {
		self.video.removeEventListener('play', self.onPlay);
		self.video.removeEventListener('pause', self.onPause);
	};
	
	this.base = com.sppad.mediamaestro.Handler;
	this.base(aBrowser, self);
}

com.sppad.mediamaestro.HtmlVideo.prototype = Object.create(com.sppad.mediamaestro.Handler.prototype);
com.sppad.mediamaestro.HtmlVideo.prototype.constructor = com.sppad.mediamaestro.HtmlVideo;
