com.sppad.BeQuiet.HtmlVideo = function(aBrowser) {
	let self = this;
	
	this.isPlaying = function() {
		if(!self.initialized)
			return false;
		
		return !self.video.paused;
	};
	
	this.play = function() {
		if(!self.initialized)
			return;
		
		self.video.play();
	};
	
	this.pause = function() {
		if(!self.initialized)
			return;
		
		self.video.pause();
	};
	
	this.next = function() {
		
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
	
	this.base = com.sppad.BeQuiet.Handler;
	this.base(aBrowser, self);
}

com.sppad.BeQuiet.HtmlVideo.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.HtmlVideo.prototype.constructor = com.sppad.BeQuiet.HtmlVideo;
