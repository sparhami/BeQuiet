var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/PopupNotifications.jsm");

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/SiteFilterRules.jsm");

BeQuiet.SiteFilter = new function() {
	
	const annotationService = Components.classes["@mozilla.org/browser/annotation-service;1"]
    	.getService(Components.interfaces.nsIAnnotationService);
	
	const ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	
	let self = this;
	
	self.getSiteURI = function(aUri) {
		return ioService.newURI(aUri.prePath, null, null);
	};
	
	self.checkPermission = function(aBrowser, aCallback, checkIfNotSet) {
		let siteUri = self.getSiteURI(aBrowser.contentDocument.documentURIObject);
		
		try {
			if(BeQuiet.SiteFilterRules.checkPermission(siteUri))
				aCallback();
		} catch(err) {
			if(checkIfNotSet)
				self.requestPermission(aBrowser, siteUri, aCallback);
		}
	};
	
	self.requestPermission = function(aBrowser, aUri, aCallback) {
		let title = "com_sppad_BeQuiet_askMediaEvents";
		let text = "Do you want to use media events for " + aUri.asciiSpec + "?";
		let browserWindow = BeQuiet.Main.getWindowForBrowser(aBrowser);
		
		browserWindow.PopupNotifications.show(aBrowser, title, text, null,
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
		BeQuiet.SiteFilterRules.addRule(aUri, allowed);
		
		if(allowed)
			aCallback();
	};
};