"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.Grooveshark = function(aBrowser) {
	const description = {
		stateChange: {
			selector : '#play-pause',
			attrName : 'class'
		},

		ratingChange: {
			selector : '#np-fav',
			attrName : 'class'
		},
		
		trackChange: {
			selector : '#now-playing-metadata',
			subselector : '.song'
		},
		
		state: {
			selector : '#play-pause',
			attrName : 'class',
			testValue : 'playing'
		},

		rating: {
			selector : '#np-fav',
			attrName : 'class',
			testValue : 'active'
		},

		title: {
			selector : '#now-playing-metadata .song',
		},

		artist: {
			selector : '#now-playing-metadata .artist',
		},
		
		albumArt: {
			selector : "#now-playing-image",
		},
		
		play: {
			selector : '#play-pause'
		},

		pause: {
			selector : '#play-pause'
		},

		next: {
			selector : '#play-next'
		},

		prev: {
			selector : '#play-prev'
		},

		like: {
			selector : '#np-fav'
		}
	};

	let self = this;

	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.Grooveshark.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.Grooveshark.prototype.constructor = BeQuiet.Grooveshark;