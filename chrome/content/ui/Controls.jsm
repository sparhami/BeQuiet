"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Controls = new function() {
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
	self.playing = false;
	
	/** The handler that is currently playing media */
	self.playingHandler = null;
	
	self.setPlayingState = function(playing) {
		for(let browserWindow of BeQuiet.Main.getWindows()) {
		 	let controls = browserWindow.document.getElementsByClassName('com_sppad_beQuiet_mediaControl');
			
	    	for(let control of controls)
				control.setAttribute('playing', playing);
		}
	};
	
	self.updateToggleTooltip = function(aEvent) {
		aEvent.target.setAttribute('label', self.playing ? 'Pause' : 'Play');
	};
	
	self.setControlsEnabled = function(enabled) {
		for(let browserWindow of BeQuiet.Main.getWindows()) {
		 	let controls = browserWindow.document.getElementsByClassName('com_sppad_beQuiet_mediaControl');
	    	for(let control of controls) {
	    		if(enabled)
	    			control.removeAttribute('disabled');
	    		else
	    			control.setAttribute('disabled', true);
	    	}
		}
	};
	
	self.isPlaying = function() {
		return self.playing;
	};
	
	self.onPlay = function(aHandler) {
		self.playing = true;
		self.playingHandler = aHandler;
		self.setPlayingState(true);
		
		setTimeout(function() {
			self.onMediaInfoChanged(aHandler);
		}, 1);
	};
	
	self.onPause = function(aHandler) {
		self.playing = false;
		self.setPlayingState(false);
	};
	
	self.onMediaInfoChanged = function(aHandler) {
		let liked = aHandler.isLiked();
		let trackInfo = aHandler.getTrackInfo();
		
		for(let browserWindow of BeQuiet.Main.getWindows()) {
			let likeButton = browserWindow.document.getElementById('com_sppad_beQuiet_media_like');
		 	let titleButton = browserWindow.document.getElementById('com_sppad_beQuiet_media_title');

		 	likeButton && likeButton.setAttribute('liked',liked);
		 	titleButton && titleButton.setAttribute('label', trackInfo.title);
		}
	};
	
	/**
	 * Used to instantly show tooltip rather than delaying. Also sets the
	 * position to anchor off the toolbar node and not the mouse.
	 */
	self.showTrackTooltip = function(aEvent) {
		let node = aEvent.target;
		let doc = node.ownerDocument;
		let tooltip = doc.getElementById('com_sppad_beQuiet_media_title_tooltip');
		
		tooltip.openPopup(node, "after_start", 0, -21, false, false, aEvent);
	};

	/**
	 * Because the track tooltip is opened manually, it needs to be closed
	 * manually as well.
	 */
	self.hideTrackTooltip = function(aEvent) {
		let node = aEvent.target;
		let doc = node.ownerDocument;
		let tooltip = doc.getElementById('com_sppad_beQuiet_media_title_tooltip');
		
		tooltip.hidePopup();
	};
	
	self.updateTrackTooltip = function(aEvent) {
		let node = aEvent.target;
		let doc = node.ownerDocument;
		let handler = self.playingHandler;
		
		for(let item of node.querySelectorAll(':not([static])'))
			node.removeChild(item);
		
		let playing = handler && handler.isPlaying();
		node.setAttribute('playing', playing);
		
		if(!playing)
			return;
			
		let trackInfo = handler.getTrackInfo();
	
		for(let infoType of ['title', 'artist', 'album']) {
			let label = doc.createElement('label');
			label.setAttribute('type', infoType);
			label.setAttribute('value', trackInfo[infoType]);
			
			node.appendChild(label);
		}
	};
	
	self.play = function() {
		BeQuiet.MediaState.play();
	};
	
	self.pause = function() {
		BeQuiet.MediaState.pause();
	};
	
	/**
	 * Switches to the tab for the currently playing handler.
	 */
	self.switchToTab = function(aEvent) {
		let handler = self.playingHandler;
		
		if(!handler)
			return;
		
		let handlerTab = handler.getTab();
		let handlerWindow = handlerTab.ownerDocument.defaultView;
		
		handlerWindow.gBrowser.selectedTab = handlerTab;
		handlerWindow.focus();
	};
	
	self.like = function() {
		if(!self.playing)
			return;
		
		self.playingHandler.like();
	};
	
	self.toggle = function() {
		if(self.playing)
			self.pause();
		else
			self.play();
	};
	
	self.next = function() {
		BeQuiet.MediaState.next();
	};
	
	self.previous = function() {
		BeQuiet.MediaState.previous();
	};
	
	BeQuiet.MediaState.addObserver(self);
};