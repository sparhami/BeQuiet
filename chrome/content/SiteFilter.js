Components.utils.import("chrome://BeQuiet/content/SiteFilterRules.jsm", com.sppad.BeQuiet);

com.sppad.BeQuiet.SiteFilter = new function() {
	
	const annotationService = Components.classes["@mozilla.org/browser/annotation-service;1"]
    	.getService(Components.interfaces.nsIAnnotationService);
	
	const ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	
	let self = this;
	
	self.getSiteURI = function(aUri) {
		return ioService.newURI(aUri.prePath, null, null);
	};
	
	self.checkPermission = function(aUri, aCallback, checkIfNotSet) {
		let siteUri = self.getSiteURI(aUri);
		
		try {
			if(com.sppad.BeQuiet.SiteFilterRules.checkPermission(siteUri))
				aCallback();
		} catch(err) {
			if(checkIfNotSet)
				self.requestPermission(siteUri, aCallback);
		}
	};
	
	self.requestPermission = function(aUri, aCallback) {
		let title = "com_sppad_BeQuiet_askMediaEvents";
		let text = "Do you want to use media events for " + aUri.asciiSpec + "?";
		
		PopupNotifications.show(gBrowser.selectedBrowser, title, text, null,
		        {
		          label: "Allow",
		          accessKey: "A",
		          callback: self.addRule.bind(self, aUri, true, aCallback)
		        },
		        [
		         {
		          label: "Deny",
		          accessKey: "D",
		          callback: self.addRule.bind(self, aUri, false, aCallback)
		         }	
		        ]
		        );
	};
	
	self.addRule = function(aUri, allowed, aCallback) {
		com.sppad.BeQuiet.SiteFilterRules.addRule(aUri, allowed);
		
		if(allowed)
			aCallback();
	};
}