"use strict";

var EXPORTED_SYMBOLS = [];

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
	self.nodes = Object.create(null);
	
	/** Nodes that have yet to be initialized */
	self.remainingNodes = Object.create(null);
	
	self.isLiked = function() {
		return self.isStatus('liked');
	};
	
	self.isPlaying = function() {
		return self.isStatus('playing');
	};
	
	self.getAlbumArt = function() {
		return self.getValue('albumArt');
	};
	
	self.getValue = function(aStatusName) {
		let node = self.getNode(aStatusName);
		
		if(!node)
			return null;
		
		let desc = self.description[aStatusName];
		let attrName = desc.attrName;
		
		return node.getAttribute(attrName);
	};
	
	self.isStatus = function(aStatusName) {
		let node = self.getNode(aStatusName);
		
		if(!node)
			return false;
		
		let desc = self.description[aStatusName];
		let attrName = desc.attrName;
		let testValue = desc.testValue;
		
		return testValue.test(node.getAttribute(attrName));
	};
	
	self.getNode = function(aStatusName) {
		if(!self.nodes[aStatusName])
			return null;
		
		let desc = self.description[aStatusName];
		let subselector = desc.subselector;
		
		let node = self.nodes[aStatusName];
		return subselector ? node.querySelector(subselector) : node;
	};
	
	
	self.getTextInfo = function(aStatusName) {
		let node = self.getNode(aStatusName);
		
		if(!node)
			return null;
		
		return node.textContent;
	};
	
	self.getTitle = function() {
		return self.getTextInfo('title');
	};
	
	self.getArtist = function() {
		return self.getTextInfo('artist');
	};
	
	self.getAlbum = function() {
		return self.getTextInfo('album');
	};
	
	self.getImageUri = function() {
		return null;
	};
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.pause = function() {
		// Need to check state as button could be a toggle
		if(!self.nodes.pause || !self.isPlaying())
			return;

		self.nodes.pause.click();
	};
	
	self.play = function() {
		// Need to check state as button could be a toggle
		if(!self.nodes.play || self.isPlaying())
			return;

		self.nodes.play.click();
	};

	self.previous = function() {
		if(!self.nodes.prev)
			return;

		self.nodes.prev.click();
	};
	
	self.next = function() {
		if(!self.nodes.next)
			return;

		self.nodes.next.click();
	};
	
	self.like = function() {
		// Need to check state as button could be a toggle
		if(!self.nodes.like || self.isLiked())
			return;

		self.nodes.like.click();
	};

	/**
	 * Loads all nodes for control and status. Checks the nodes not yet loaded
	 * and attempts to find them using the appropriate selector.
	 * 
	 * @return True if there are no more nodes to initialize, false otherwise.
	 */
	self.initialize = function() {
		let initialized  = true;
		
		let items = self.remainingNodes;
		
		for(let key in items) {
			let selector = self.description[key].selector;
			let node = self.doc.querySelector(selector);
			
			self.nodes[key] = node;
			
			if(node !== null)
				delete self.remainingNodes[key];
			else
				initialized = false;
		}
		
		return initialized;
	};

	self.registerListeners = function() {
		let win = self.doc.defaultView;
		
		self.playObs = new win.MutationObserver( a => self.updatePlayingState() );
		self.infoObs = new win.MutationObserver( a => self.mediaInfoChanged() );
		self.ratingObs = new win.MutationObserver( a => self.mediaRatingChanged() );
		
		if(self.nodes.playing) 
			self.playObs.observe(self.nodes.playing, { attributes: true, subtree: true, childList: true });
		
		if(self.nodes.title) 
			self.infoObs.observe(self.nodes.title, { attributes: true, subtree: true, childList: true });
		
		if(self.nodes.liked)
			self.ratingObs.observe(self.nodes.liked, { attributes: true, subtree: true, childList: true });
	};

	self.unregisterListeners = function() {
		self.playObs.disconnect();
		self.infoObs.disconnect();
		self.ratingObs.disconnect();
	};
	
	for(let key in self.description)
		self.remainingNodes[key] = key;

	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.NodeBasedHandler.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.NodeBasedHandler.prototype.constructor = BeQuiet.NodeBasedHandler;