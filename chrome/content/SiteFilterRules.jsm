"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/collect/Iterable.jsm");

BeQuiet.SiteFilterRules = new function() {
	
	const tagsService = Components.classes["@mozilla.org/browser/tagging-service;1"]
    	.getService(Components.interfaces.nsITaggingService);
	
	const filterAllowed = "media_events_allowed";
	
	const filterDenied = "media_events_denied";
	
	let self = this;
	
	self.observers = new Set();
	
	self.checkPermission = function(aUri) {
		let tags = tagsService.getTagsForURI(aUri);
		
		for(let tag of tags) {
			if(tag === filterAllowed)
				return true;
			
			if(tag === filterDenied)
				return false;
		}
		
		throw Error("No filter rule");
	};

	self.addRule = function(aUri, allowed) {
		tagsService.untagURI(aUri, [filterAllowed, filterDenied]);
		tagsService.tagURI(aUri, [ allowed ? filterAllowed : filterDenied ]);
		
		for(let observer of self.observers)
			observer.onRuleAdded(aUri, allowed);
	};
	
	self.removeRule = function(aUri) {
		tagsService.untagURI(aUri, [filterAllowed, filterDenied]);
		
		for(let observer of self.observers)
			observer.onRuleRemoved(aUri);
	};
	
	self.getFilterRules = function() {
		for(let uri of tagsService.getURIsForTag(filterAllowed))
			yield { 'uri': uri, 'allowed': true };
				
		for(let uri of tagsService.getURIsForTag(filterDenied))
			yield { 'uri': uri, 'allowed': false };
	};
	
	self.addObserver = function(observer) {
		self.observers.add(observer);
	};
	
	self.removeObserver = function(observer) {
		self.observers.delete(observer);
	};
};