"use strict";

var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/handlers/NodeBasedHandler.jsm");

BeQuiet.Soundcloud = function(aBrowser) {
	const description = {
		stateChange: {
			selector : '#app',
			subselector : '.playControl',
			attrName : 'class'
		},

		trackChange: {
			selector : '#app',
			subselector : '.playbackTitle',
			attrName: 'href'
		},
		
		state: {
			selector : '.playControl',
			attrName : 'class',
			testValue : 'playing'
		},

		title: {
			selector : '.playbackTitle'
		},

		play: {
			selector : '.playControl'
		},

		pause: {
			selector : '.playControl'
		},

		next: {
			selector : '.skipControl_next'
		},

		prev: {
			selector : '.skipControl_previous'
		}
	};

	let self = this;

	self.base = BeQuiet.NodeBasedHandler;
	self.base(aBrowser, description);
};

BeQuiet.Soundcloud.prototype = Object.create(BeQuiet.NodeBasedHandler.prototype);
BeQuiet.Soundcloud.prototype.constructor = BeQuiet.Soundcloud;