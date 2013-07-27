"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Alerts = new function() {
	const alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService);
	
	const observerService = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
	self.observe = function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case 'com_sppad_BeQuiet_mediaState':
				self.mediaStateChange(aData);
				break;
			case 'com_sppad_BeQuiet_mediaTrackInfo':
				self.mediaInfoChange();
				break;
		}
		
	};
	
	self.mediaStateChange = function(aState) {
		if(aState !== 'play' || !prefs['notifications.showOnPlay'])
			return;
		
		self.showAlert();
	};
	
	
	self.mediaInfoChange = function() {
		// Delay to let all status items to update
		setTimeout(function() { self.showAlert(); }, 1000);
	};
	
	self.showAlert = function() {
		if(!prefs['notifications.showTrackInfo'])
			return;
		
		let handler = BeQuiet.MediaState.playingHandler;
		let trackInfo = handler.getTrackInfo();
		let albumArt = handler.getAlbumArt();
		
		alertsService.showAlertNotification(
				albumArt,
				self.getAlertTitle(trackInfo),
				self.getAlertText(trackInfo),
				false,
				"",
				null,
				"BeQuiet_trackInfoAlert");
	};
	
	self.getAlertTitle = function(trackInfo) {
		return self.truncate(trackInfo.title, prefs['notifications.maxCharactersPerLine']);
	};
	
	self.getAlertText = function(trackInfo) {
		return [trackInfo.artist, trackInfo.album]
			.filter( a => a )
			.map( a => self.truncate(a, prefs['notifications.maxCharactersPerLine']) )
			.join("\n");
	};
	
	// TODO - figure out how to get ellipsis character into alert text
	self.truncate = function(aString, n) {
		return aString.length <= n ? aString : aString.substr(0, n-3) + '...';
	};
	
	observerService.addObserver(self, 'com_sppad_BeQuiet_mediaState', false);
	observerService.addObserver(self, 'com_sppad_BeQuiet_mediaTrackInfo', false);
};