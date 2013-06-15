com.sppad.BeQuiet.HtmlVideo = function(aBrowser) {
	let self = this;
	
	self.media = null;
	self.videos = null;
	self.audios = null;
	
	this.isPlaying = function() {
		if(self.media == null)
			return false;
		
		return !self.media.paused;
	};
	
	this.play = function() {
		let media = self.media || self.getFirstMedia();
		
		if(media != null)
			media.play();
	};
	
	this.pause = function() {
		if(self.media != null)
			self.media.pause();
	};
	
	this.isActive = function() {
		return self.media != null || self.getFirstMedia() != null;
	};
	
	this.getFirstMedia = function() {
		return self.videos[0] || self.audios[0];
	};
	
	this.mediaPlay = function(aEvent) {
		let media = aEvent.target;
		let tagName = media.tagName.toUpperCase();
		
		if(tagName != "VIDEO" && tagName != "AUDIO")
			return;
		
		self.media = media;
		
		com.sppad.collect.Iterable.from(self.videos, self.audios)
			.filter(function(item) { return item !== self.media })
			.forEach(function(item) { item.pause(); });
		
		self.onPlay();
	};
	
	this.mediaPause = function(aEvent) {
		if(self.media === aEvent.target)
			self.onPause();
	};
	
	this.next = function() {
		
	};
	
	this.initialize = function() {
		// Live collections, so can just get them once during init
		self.videos = self.doc.getElementsByTagName('video');
		self.audios = self.doc.getElementsByTagName('audio');
		
		return true;
	};	
	
	this.registerListeners = function() {
		self.doc.addEventListener('play', self.mediaPlay, true);
		self.doc.addEventListener('pause', self.mediaPause, true);
	};
	
	this.unregisterListeners = function() {
		self.doc.removeEventListener('play', self.mediaPlay);
		self.doc.removeEventListener('pause', self.mediaause);
	};
	
	this.base = com.sppad.BeQuiet.Handler;
	this.base(aBrowser, self);
}

com.sppad.BeQuiet.HtmlVideo.prototype = Object.create(com.sppad.BeQuiet.Handler.prototype);
com.sppad.BeQuiet.HtmlVideo.prototype.constructor = com.sppad.BeQuiet.HtmlVideo;
