"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");

/**
 * Takes in an object of the following format, describing how to perform actions
 * for the handler by specifying selectors to get nodes and values to check for.
 * Only control.play, control.pause and status.playing are required.
 * 
 * <pre>
 * {  
 *    control: {
 *    	play:  selector
 *    	pause: selector
 *    	prev:  selector
 *    	next:  selector
 *    	like:  selector
 *    },
 *    
 *    status: {
 *    	playing: {
 *     		selector:  selector
 *      	attrName:  attribute
 *     		testValue: regex
 *    	},
 *    
 *      liked: {
 *     		selector:  selector
 *      	attrName:  attribute
 *     		testValue: regex
 *    	},
 *    
 *    	title: {
 *    		selector: selector
 *    	},
 *    
 *      artist: {
 *    		selector: selector
 *    	},
 *    
 *      album: {
 *    		selector: selector
 *    	}
 *    }
 * }
 * </pre>
 */
BeQuiet.NodeBasedHandler = function(aBrowser, aHandlerDescription) {
	let self = this;
	
	/**
	 * Description providing selectors, attribute names and values to test
	 * against
	 */
	self.description = aHandlerDescription;
	
	/** Tracks the nodes for the control buttons used */
	self.controlButtons = {};
	
	/** Tracks the nodes for the status items */
	self.statusNodes = {};
	
	self.isLiked = function() {
		return self.isStatus('liked');
	};
	
	self.isPlaying = function() {
		return self.isStatus('playing');
	};
	
	/**
	 * @param aStatusName
	 *            the name of the status to check
	 * @return The result of testing the attribute of the status against the
	 *         test value
	 */
	self.isStatus = function(aStatusName) {
		if(!self.statusNodes[aStatusName])
			return false;
		
		let attrName = self.description.status[aStatusName].attrName;
		let testValue = self.description.status[aStatusName].testValue;
		
		let attribute = self.statusNodes[aStatusName].getAttribute(attrName);
		
		return testValue.test(attribute);
	};
	
	self.getTrackInfo = function() {
		return {
			title: self.getTitle(),
			artist: self.getArtist(),
			album: self.getAlbum()
		};
	};
	
	self.getTitle = function() {
		return self.statusNodes.title ? self.statusNodes.title.innerHTML : undefined;
	};
	
	self.getArtist = function() {
		return self.statusNodes.artist ? self.statusNodes.artist.innerHTML : undefined;
	};
	
	self.getAlbum = function() {
		return self.statusNodes.album ? self.statusNodes.album.innerHTML : undefined;
	};
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	/**
	 * Causes the media to pause if the control exists.
	 */
	self.pause = function() {
		// Need to check playing state since button could be play/pause toggle
		if(!self.controlButtons.pause || !self.isPlaying())
			return;

		self.controlButtons.pause.click();
	};
	
	/**
	 * Causes the media to play if the control exists.
	 */
	self.play = function() {
		// Need to check playing state since button could be play/pause toggle
		if(!self.controlButtons.play || self.isPlaying())
			return;

		self.controlButtons.play.click();
	};

	
	/**
	 * Goes to the previous track if the control exists.
	 */
	self.previous = function() {
		if(!self.controlButtons.prev)
			return;

		self.controlButtons.prev.click();
	};
	
	
	/**
	 * Goes to the next track if the control exists.
	 */
	self.next = function() {
		if(!self.controlButtons.next)
			return;

		self.controlButtons.next.click();
	};
	
	/**
	 * Performs a like if the control exists and the media is not already liked.
	 */
	self.like = function() {
		if(!self.controlButtons.like || self.isLiked())
			return;

		self.controlButtons.like.click();
	};

	/**
	 * Loads all nodes for control and status buttons. Must have at least
	 * play/pause buttons and node for playing status.
	 */
	self.initialize = function() {
		let control = self.description.control;
		let status = self.description.status;
		
		for(let controlName in control)
			self.controlButtons[controlName] = self.doc.querySelector(control[controlName]);
		
		for(let statusName in status)
			self.statusNodes[statusName] = self.doc.querySelector(status[statusName].selector);

		return self.controlButtons.play != null 
			&& self.controlButtons.pause != null
			&& self.statusNodes.playing != null;
	};

	self.registerListeners = function() {
		// Observes mutation events on nodes in order to to detect media events
		self.mediaObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	        	if(mutation.target === self.statusNodes.playing)
	    			setTimeout(function() { self.updatePlayingState(); }, 1);
	        	else
	    			setTimeout(function() { self.mediaInfoChanged(); }, 1);
	        }); 
		});

		// Observe all status nodes for mutations
		for(let statusName in self.statusNodes)
			self.mediaObserver.observe(self.statusNodes[statusName], { attributes : true });
	};

	self.unregisterListeners = function() {
		self.mediaObserver.disconnect();
	};

	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.NodeBasedHandler.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.NodeBasedHandler.prototype.constructor = BeQuiet.NodeBasedHandler;