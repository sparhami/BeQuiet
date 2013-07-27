"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");

/**
 * Watches for an attribute on a node to change.
 * 
 * @param aDocument
 *            The document containing the node
 * @param aNode
 *            The node to watch for changes
 * @param aAttributeName
 *            The attribute to watch for changes
 */
BeQuiet.StaticNodeWatcher = function(aDocument, aNode, aAttributeName) {
	let self = this;

	self.attributeName = aAttributeName;
	self.node = aNode;
	
	self.observer = new aDocument.defaultView.MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if(self.attributeName != mutation.attributeName)
				return;
			
			self.callback(self.node);
		});
	});

	self.setCallback = function(aCallback) {
		self.callback = aCallback;
	};
	
	self.observer.observe(aNode, { attributes: true });
};

/**
 * Watches for a descendant node that may be added/deleted by the page.
 * 
 * @param aDocument
 *            The document containing the node
 * @param aAncestorNode
 *            A node that is an ancestor of the desired node, which is permanent
 *            on the page. This is should be as close as possible hierarchy wise
 * @param aSelector
 *            A selector to get the node, relative to aAncestorNode
 * @param aAttributeName
 *            Optional, if specified, also calls the callback when the
 *            dynamically added node's given attribute changes
 */
BeQuiet.DynamicNodeWatcher = function(aDocument, aAncestorNode, aSelector, aAttributeName) {
	let self = this;
	
	self.doc = aDocument;

	self.ancestorNode = aAncestorNode;
	self.selector = aSelector;
	self.attributeName = aAttributeName;
	self.node = null;
	
	self.staticNodeWatcher = null;
	
	self.observer = new aDocument.defaultView.MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			self.getNode();
		});
	});

	self.nodeAdded = function() {
		self.callback(self.node);
		
		if(self.attributeName) {
			self.staticNodeWatcher = new BeQuiet.StaticNodeWatcher(self.doc, self.node, self.attributeName);
			self.staticNodeWatcher.setCallback(self.callback);
		}
	};
	
	self.getNode = function() {
		if(self.node && self.ancestorNode.contains(self.node))
			return;
	
		self.node = self.ancestorNode.querySelector(self.selector);
		self.node && self.nodeAdded();
	};
	
	self.setCallback = function(aCallback) {
		self.callback = aCallback;
		self.getNode();
	};
	
	self.observer.observe(aAncestorNode, { subtree: true, childList: true });
};