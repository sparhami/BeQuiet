var EXPORTED_SYMBOLS = ["SiteFilterEngine"];

SiteFilterEngine = new function() {
	
	const annotationService = Components.classes["@mozilla.org/browser/annotation-service;1"]
    	.getService(Components.interfaces.nsIAnnotationService);
	
	const ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	
	const filterAnnotationName = "com_sppad_BeQuiet/filterRule";
	
	let self = this;
	
	self.observers = new Set();
	
	self.getSiteURI = function(aUri) {
		return ioService.newURI(aUri.prePath, null, null);
	};
	
	self.checkPermission = function(aUri) {
		let siteURI = self.getSiteURI(aUri);
		return annotationService.getPageAnnotation(siteURI, filterAnnotationName);
	};

	self.addRule = function(aUri, allowed) {
		let siteURI = self.getSiteURI(aUri);
		annotationService.setPageAnnotation(aUri, filterAnnotationName, allowed, 0, annotationService.EXPIRE_NEVER);
	
		for(let observer of self.observers)
			observer.onRuleAdded(aUri, allowed);
	};
	
	self.removeRule = function(aUri) {
		annotationService.removePageAnnotation(aUri, filterAnnotationName);
		
		for(let observer of self.observers)
			observer.onRuleRemoved(aUri);
	};
	
	self.getFilterRules = function() {
		let results = annotationService.getPagesWithAnnotation(filterAnnotationName);
		
		for(let uri of results) {
			let allowed = annotationService.getPageAnnotation(uri, filterAnnotationName);
			yield { 'uri': uri, 'allowed': allowed };
		}
	};
	
	self.addObserver = function(observer) {
		self.observers.add(observer);
	};
	
	self.removeObserver = function(observer) {
		self.observers.delete(observer);
	};
}