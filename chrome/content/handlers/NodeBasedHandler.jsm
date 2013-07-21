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
 * 		// Controls
 *  	play : { 
 * 			selector : selector,
 * 		},
 * 
 * 		pause : {
 * 			selector : selector,
 * 		},
 * 
 * 		prev : {
 * 			selector : selector,
 * 		},
 * 
 * 		next : { 
 * 			selector : selector,
 * 		},
 * 
 * 		like : {
 * 			selector : selector,
 * 		},
 * 
 * 		// Status nodes
 * 		playing : {
 * 			selector : selector,
 * 			subselector : selector, // optional
 * 			attrName : attribute,
 * 			testValue : regex
 * 		},
 * 
 * 		liked : {
 * 			selector : selector,
 * 			subselector : selector, // optional
 * 			attrName : attribute,
 * 			testValue : regex
 * 		},
 * 
 * 		title : {
 * 			selector : selector,
 * 			subselector : selector  // optional
 * 		},
 * 
 * 		artist : {
 * 			selector : selector,
 * 			subselector : selector  // optional
 * 		},
 * 
 * 		album : {
 * 			selector : selector,
 * 			subselector : selector  // optional
 * 		}
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
	
	/** Tracks the nodes for controls and status */
	self.nodes = {};
	
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
		if(!self.nodes[aStatusName])
			return false;
		
		let desc = self.description[aStatusName];
		let attrName = desc.attrName;
		let testValue = desc.testValue;
		let subselector = desc.subselector;
		
		let node = self.nodes[aStatusName];
		node = subselector ? node.querySelector(subselector) : node;
		
		return testValue.test(node.getAttribute(attrName));
	};
	
	/**
	 * @param aStatusName
	 *            the name of the status to check
	 * @return The innerHTML of the status item
	 */
	self.getTextInfo = function(aStatusName) {
		if(!self.nodes[aStatusName])
			return undefined;
		
		let desc = self.description[aStatusName];
		let testValue = desc.testValue;
		let subselector = desc.subselector;
		
		let node = self.nodes[aStatusName];
		node = subselector ? node.querySelector(subselector) : node;
		
		return node.innerHTML;
		
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
		if(!self.nodes.pause || !self.isPlaying())
			return;

		self.nodes.pause.click();
	};
	
	/**
	 * Causes the media to play if the control exists.
	 */
	self.play = function() {
		// Need to check playing state since button could be play/pause toggle
		if(!self.nodes.play || self.isPlaying())
			return;

		self.nodes.play.click();
	};

	
	/**
	 * Goes to the previous track if the control exists.
	 */
	self.previous = function() {
		if(!self.nodes.prev)
			return;

		self.nodes.prev.click();
	};
	
	
	/**
	 * Goes to the next track if the control exists.
	 */
	self.next = function() {
		if(!self.nodes.next)
			return;

		self.nodes.next.click();
	};
	
	/**
	 * Performs a like if the control exists and the media is not already liked.
	 */
	self.like = function() {
		if(!self.nodes.like || self.isLiked())
			return;

		self.nodes.like.click();
	};

	/**
	 * Loads all nodes for control and status buttons.
	 */
	self.initialize = function() {
		// Checks that all declared controls and status items are initialized
		let initialized  = true;
		
		let items = self.description;
		
		for(let key in items) {
			let selector = items[key].selector;
			let node = self.doc.querySelector(selector);
			
			self.nodes[key] = node;
			initialized &= (node !== null)
		}
		
		return initialized;
	};

	self.registerListeners = function() {
		// Observes mutation events on nodes in order to to detect media events
		self.mediaObserver = new self.doc.defaultView.MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	        	if(mutation.target === self.nodes.playing)
	    			setTimeout(function() { self.updatePlayingState(); }, 1);
	        	else
	    			setTimeout(function() { self.mediaInfoChanged(); }, 1);
	        }); 
		});

		// Observe all status nodes for mutations
		for(let key in self.nodes)
			self.mediaObserver.observe(self.nodes[key], { attributes : true });
	};

	self.unregisterListeners = function() {
		self.mediaObserver.disconnect();
	};

	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.NodeBasedHandler.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.NodeBasedHandler.prototype.constructor = BeQuiet.NodeBasedHandler;