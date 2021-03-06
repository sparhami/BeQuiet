"use strict";

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
    self.prefChanged = function(name, value) {
	    if(name.startsWith('shortcut'))
	    	self.updateKeybind(name.split('\.')[1]);
    };
    
    /**
	 * Note: currently requires browser restart in order to change keybinding.
	 */
    self.updateKeybind = function(name) {
    	let branch = "shortcut." + name + ".";
    	let modBranch = branch + "modifiers.";
    	
    	let key = prefs[branch + "key"];
    	let enabled = key != '';
    	let modifiers = ['alt', 'shift', 'control', 'meta']
    		.filter(function(mod) { return prefs[modBranch + mod]; })
    		.join(',');
    	
    	let commandNode = window.document.getElementById('key_' + name);
    	
    	if(enabled)
    		commandNode.removeAttribute('disabled');
    	else
    		commandNode.setAttribute('disabled', true);

    	commandNode.setAttribute('key', key);   	
    	commandNode.setAttribute('modifiers', modifiers);
    };

    window.addEventListener('load', function() {
     	BeQuiet.Preferences.addPreferenceObserver(self);
    	
    	let initialPrefs = ['shortcut.com_sppad_mediaToggleState.',
    	                    'shortcut.com_sppad_mediaNext.',
    	                    'shortcut.com_sppad_mediaPrevious.'];
    	
    	for(let pref of initialPrefs)
            self.prefChanged(pref, prefs[pref]);
    });
    
    window.addEventListener('unload', function() {
    	BeQuiet.Preferences.removePreferenceObserver(self);
    });
};