var EXPORTED_SYMBOLS = [];

Components.utils.import("chrome://BeQuiet/content/ns.jsm");
Components.utils.import("chrome://BeQuiet/content/preferences/preferences.jsm");

BeQuiet.Settings = new function() {
	
	const prefs = BeQuiet.CurrentPrefs;
	
	let self = this;
	
    self.prefChanged = function(name, value) {
        switch(name) {
        	case 'enablePauseResume': 
        		self.enablePauseResume(value);
        		break;
            default:
                if(name.startsWith('shortcut')) {
                	self.updateKeybind(name.split('\.')[1]);
                }
                break;
        }
    };
    
    self.enablePauseResume = function(enabled) {
    	BeQuiet.Controls.setControlsEnabled(enabled);
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
    	
    	let commandNode = window.document.getElementById(name);
    	
    	if(enabled)
    		commandNode.removeAttribute('disabled');
    	else
    		commandNode.setAttribute('disabled', true);

    	commandNode.setAttribute('key', key);   	
    	commandNode.setAttribute('modifiers', modifiers);
    };

    window.addEventListener('load', function() {
     	BeQuiet.Preferences.addObserver(self);
    	
    	let initialPrefs = ['shortcut.com_sppad_mediaToggleState.',
    	                    'shortcut.com_sppad_mediaNext.',
    	                    'shortcut.com_sppad_mediaPrevious.',
    	                    'enablePauseResume'];
    	
    	for(let pref of initialPrefs)
            self.prefChanged(pref, prefs[pref]);
    });
    
    window.addEventListener('unload', function() {
    	BeQuiet.Preferences.removeObserver(self);
    });
};