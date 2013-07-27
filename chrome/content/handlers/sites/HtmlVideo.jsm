"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm", BeQuiet);

BeQuiet.HtmlVideo = function(aBrowser) {
	let self = this;
	
	self.media = null;
	self.videos = null;
	self.audios = null;
	
	self.isLiked = function() {
		return false;
	};
	
	self.isPlaying = function() {
		if(self.media == null)
			return false;
		
		return !self.media.paused;
	};
	
	self.getAlbumArt = function() {
		return null;
	};
	
	self.getTitle = function() {
		return self.doc.title;
	};
	
	self.getArtist = function() {
		return null;
	};
	
	self.getAlbum = function() {
		return null;
	};
	
	self.hasMedia = function() {
		return self.media != null || self.getFirstMedia() != null;
	};
	
	self.pause = function() {
		if(self.media != null)
			self.media.pause();
	};
	
	self.play = function() {
		let media = self.media || self.getFirstMedia();
		
		if(media != null)
			media.play();
	};
	
	self.previous = function() {

	};
	
	self.next = function() {
		
	};
	
	
	self.like = function() {
		
	};
	
	
	self.getFirstMedia = function() {
		return self.videos[0] || self.audios[0];
	};
	
	self.mediaPlay = function(aEvent) {
		let media = aEvent.target;
		let tagName = media.tagName.toUpperCase();
		
		if(tagName != "VIDEO" && tagName != "AUDIO")
			return;
		
		self.media = media;
		
		BeQuiet.Iterable.from(self.videos, self.audios)
			.filter(function(item) { return item !== self.media })
			.forEach(function(item) { item.pause(); });
		
		self.onPlay();
	};
	
	self.mediaPause = function(aEvent) {
		if(self.media === aEvent.target)
			self.onPause();
	};
	
	self.initialize = function() {
		// Live collections, so can just get them once during init
		self.videos = self.doc.getElementsByTagName('video');
		self.audios = self.doc.getElementsByTagName('audio');
		
		return true;
	};	
	
	self.registerListeners = function() {
		self.doc.addEventListener('play', self.mediaPlay, true);
		self.doc.addEventListener('pause', self.mediaPause, true);
	};
	
	self.unregisterListeners = function() {
		self.doc.removeEventListener('play', self.mediaPlay);
		self.doc.removeEventListener('pause', self.mediaause);
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.HtmlVideo.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.HtmlVideo.prototype.constructor = BeQuiet.HtmlVideo;
