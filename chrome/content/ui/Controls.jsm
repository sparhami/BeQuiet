"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Controls = new function() {
	
	const observerService = Components.classes["@mozilla.org/observer-service;1"]
    	.getService(Components.interfaces.nsIObserverService);
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
	self.observe = function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case 'com_sppad_BeQuiet_mediaState':
				self.mediaStateChange(aData);
				break;
			case 'com_sppad_BeQuiet_mediaTrackInfo':
				self.mediaInfoChange();
				break;
			case 'com_sppad_BeQuiet_mediaTrackRating':
				self.mediaRatingChange();
				break;
		}
		
	};
	
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
	
	self.mediaStateChange = function(aState) {
		let playing = aState === 'play';
		self.setPlayingState(playing);
		
		if(playing) {
			self.mediaInfoChange();
			self.mediaRatingChange();
		}

	};

	self.mediaInfoChange = function() {
		let handler = BeQuiet.MediaState.playingHandler;
		let trackInfo = handler.getTrackInfo();
		
		for(let browserWindow of BeQuiet.Main.getWindows()) {
			let titleButton = browserWindow.document.getElementById('com_sppad_beQuiet_media_title');
		 	titleButton && titleButton.setAttribute('label', trackInfo.title);
		}
	};
	
	self.mediaRatingChange = function() {
		let handler = BeQuiet.MediaState.playingHandler;
		let liked = handler.isLiked();
		
		for(let browserWindow of BeQuiet.Main.getWindows()) {
			let likeButton = browserWindow.document.getElementById('com_sppad_beQuiet_media_like');
		 	likeButton && likeButton.setAttribute('liked', liked);
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
		let handler = BeQuiet.MediaState.playingHandler;
		
		for(let item of node.querySelectorAll(':not([static])'))
			node.removeChild(item);
		
		let playing = handler && handler.isPlaying();
		node.setAttribute('playing', playing);
		
		if(!playing)
			return;
			
		let trackInfo = handler.getTrackInfo();
	
		for(let infoType of ['title', 'artist', 'album']) {
			if(!trackInfo[infoType])
				continue;
			
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
		let handler = BeQuiet.MediaState.playingHandler;
		
		if(!handler)
			return;
		
		let handlerTab = handler.getTab();
		let handlerWindow = handlerTab.ownerDocument.defaultView;
		
		handlerWindow.gBrowser.selectedTab = handlerTab;
		handlerWindow.focus();
	};
	
	self.like = function() {
		if(!BeQuiet.MediaState.isPlaying())
			return;
		
		BeQuiet.MediaState.playingHandler.like();
	};
	
	self.toggle = function() {
		if(BeQuiet.MediaState.isPlaying())
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
	
	observerService.addObserver(self, 'com_sppad_BeQuiet_mediaState', false);
	observerService.addObserver(self, 'com_sppad_BeQuiet_mediaTrackInfo', false);
	observerService.addObserver(self, 'com_sppad_BeQuiet_mediaTrackRating', false);
};
