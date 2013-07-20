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
 *    	play:  selector,
 *    	pause: selector,
 *    	prev:  selector,
 *    	next:  selector,
 *    	like:  selector
 *    },
 *    
 *    status: {
 *    	playing: {
 *     		selector:  selector,
 *      	subSelector: selector, // optional
 *      	attrName:  attribute,
 *     		testValue: regex
 *    	},
 *    
 *      liked: {
 *     		selector:  selector,
 *      	subSelector: selector, // optional
 *      	attrName:  attribute,
 *     		testValue: regex
 *    	},
 *    
 *    	title: {
 *    		selector: selector,
 *    		subSelector: selector  // optional
 *    	},
 *    
 *      artist: {
 *    		selector: selector,
 *   		subSelector: selector  // optional
 *    	},
 *    
 *      album: {
 *    		selector: selector,
 *       	subSelector: selector  // optional
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
		
		let desc = self.description.status[aStatusName];
		let attrName = desc.attrName;
		let testValue = desc.testValue;
		let subSelector = desc.subSelector;
		
		let node = self.statusNodes[aStatusName];
		node = subSelector ? node.querySelector(subSelector) : node;
		
		return testValue.test(node.getAttribute(attrName));
	};
	
	self.getTextInfo = function(aStatusName) {
		if(!self.statusNodes[aStatusName])
			return "";
		
		let desc = self.description.status[aStatusName];
		let testValue = desc.testValue;
		let subSelector = desc.subSelector;
		
		let node = self.statusNodes[aStatusName];
		node = subSelector ? node.querySelector(subSelector) : node;
		
		return node ? node.innerHTML : "";
		
	};
	
	self.getTrackInfo = function() {
		return {
			title: self.getTextInfo('title'),
			artist: self.getTextInfo('artist'),
			album: self.getTextInfo('album')
		};
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
	 * Loads all nodes for control and status buttons.
	 */
	self.initialize = function() {
		// Checks that all declared controls and status items are initialized
		let initialized  = true;
		
		let control = self.description.control;
		let status = self.description.status;
		
		for(let name in control) {
			let node = self.doc.querySelector(control[name]);
			self.controlButtons[name] = node;
			
			initialized &= (node !== null)
		}
		
		for(let name in status) {
			let node = self.doc.querySelector(status[name].selector);
			self.statusNodes[name] = node;
			
			initialized &= (node !== null);
		}

		return initialized;
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