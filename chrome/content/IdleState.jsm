"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/MediaState.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.IdleState = new function() {
	
	const SECONDS_PER_MINUTE = 60.0;
	
	const idleService = Components.classes["@mozilla.org/widget/idleservice;1"]
		.getService(Components.interfaces.nsIIdleService);
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	self.idleTime = null;
	
    self.prefChanged = function(name, value) {
        switch(name) {
        	case 'idlePause':
          	case 'idleResume':
        	case 'idleTime': 
        		self.updateObserver();
        		break;
        }
    };
    
    self.updateObserver = function() {
    	// Remove observer for previous idle time
    	if(self.idleTime) {
    		idleService.removeIdleObserver(self.idleObserver, self.idleTime);
        	self.idleTime = null;
    	}

    	if(prefs.idlePause || prefs.idleResume) {
        	self.idleTime = Math.floor(prefs.idleTime * SECONDS_PER_MINUTE);
      		idleService.addIdleObserver(self.idleObserver, self.idleTime);
    	}
    };
    
	self.idleObserver = {
		observe: function(subject, topic, data) {
			if(topic === 'idle' && prefs.idlePause)
				BeQuiet.MediaState.pause();
			else if(topic === 'active' && prefs.idleResume)
				BeQuiet.MediaState.play();
		}
	};
	
	self.prefChanged('idleTime', prefs.idleTime);
 	BeQuiet.Preferences.addPreferenceObserver(self);
};