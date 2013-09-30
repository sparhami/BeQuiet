"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/Handler.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeWatcher.jsm");

/**
 * Takes in an object of the following format, describing how to perform actions
 * for the handler by specifying selectors to get nodes and values to check for.
 * 
 * <pre>
 * {
 *  // Status
 * 	stateChange : {
 * 		selector : selector,
 * 		subselector : selector,
 * 		attrName : attribute,
 * 		testValue : regex
 * 	},
 * 
 * 	ratingChange : {
 * 		selector : selector,
 * 		subselector : selector,
 * 		attrName : attribute,
 * 		testValue : regex
 * 	},
 * 
 * 	trackChange : {
 * 		selector : selector,
 * 		subselector : selector,
 * 		attrName : attribute
 * 	},
 * 
 * 	// Text status nodes
 * 	title : {
 * 		selector : selector
 * 	},
 * 
 * 	artist : {
 * 		selector : selector
 * 	},
 * 
 * 	album : {
 * 		selector : selector
 * 	},
 * 
 *  albumArt : {
 *  	selector : selector
 *  },
 * 
 * 	// Buttons
 * 	play : {
 * 		selector : selector
 * 	},
 * 
 * 	pause : {
 * 		selector : selector
 * 	},
 * 
 * 	prev : {
 * 		selector : selector
 * 	},
 * 
 * 	next : {
 * 		selector : selector
 * 	},
 * 
 * 	like : {
 * 		selector : selector
 * 	}
 * }
 * </pre>
 */
BeQuiet.NodeBasedHandler = function(aBrowser, aHandlerDescription) {
	let self = this;
	
	self.description = aHandlerDescription;
	
	/** Tracks the nodes for status*/
	self.nodes = {};
	
	self.watchers = {};
	
	self.isLiked = function() {
		return self.isStatus('rating');
	};
	
	self.isPlaying = function() {
		return self.isStatus('state');
	};
	
	self.getAlbumArt = function() {
		let node = self.getNode('albumArt');
		return node ? node.getAttribute('src') : null; 
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
	
	self.hasMedia = function() {
		return self.initialized;
	};
	
	self.pause = function() {
		// Need to check state as button could be a toggle
		if(self.isPlaying())
			self.action('pause');
	};
	
	self.play = function() {
		// Need to check state as button could be a toggle
		if(!self.isPlaying())
			self.action('play');
	};

	self.previous = function() {
		self.action('prev');
	};
	
	self.next = function() {
		self.action('next');
	};
	
	self.like = function() {
		// Need to check state as button could be a toggle
		if(!self.isLiked())
			self.action('like');
	};
	
	self.action = function(aName) {
		let node = self.doc.querySelector(self.description[aName].selector);
		node && node.click();
	};

	self.initialize = function() {
		let desc = self.description;
		
		for(let name of ['trackChange', 'stateChange', 'ratingChange'])
			if(desc[name])
				self.nodes[name] = self.doc.querySelector(desc[name].selector);
			
		return self.nodes.stateChange != null;
	};

	self.registerListeners = function() {
		let desc = self.description;
		
		for(let name of ['trackChange', 'stateChange', 'ratingChange']) {
			if(!self.nodes[name])
				continue;
				
			if(desc[name].subselector)
				self.watchers[name] = new BeQuiet.DynamicNodeWatcher(self.doc, self.nodes[name], desc[name].subselector, desc[name].attrName);
			else
				self.watchers[name] = new BeQuiet.StaticNodeWatcher(self.doc, self.nodes[name], desc[name].attrName);
		}
	
		self.watchers.trackChange && self.watchers.trackChange.setCallback(self.mediaInfoChanged);
		self.watchers.stateChange && self.watchers.stateChange.setCallback(self.updatePlayingState);
		self.watchers.ratingChange && self.watchers.ratingChange.setCallback(self.mediaRatingChanged);
	};

	self.unregisterListeners = function() {

	};
	
	self.isStatus = function(aStatusName) {
		let node = self.getNode(aStatusName);
		
		if(!node)
			return false;
		
		let desc = self.description[aStatusName];
		let attrName = desc.attrName;
		let testValue = desc.testValue;
		
		if(attrName === "class")
			return node.classList.contains(testValue);
		else
			return testValue.test(node.getAttribute(attrName));
	};
	
	self.getNode = function(aStatusName) {
		return self.description[aStatusName] ? self.doc.querySelector(self.description[aStatusName].selector) : undefined;
	};
	
	self.getTextInfo = function(aStatusName) {
		let node = self.getNode(aStatusName);
		return node ? node.textContent : null;
	};
	
	self.base = BeQuiet.Handler;
	self.base(aBrowser, self);
};

BeQuiet.NodeBasedHandler.prototype = Object.create(BeQuiet.Handler.prototype);
BeQuiet.NodeBasedHandler.prototype.constructor = BeQuiet.NodeBasedHandler;