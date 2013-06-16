com.sppad.BeQuiet.Settings = new function() {
	
	const prefs = com.sppad.BeQuiet.CurrentPrefs;
	
	let self = this;
	
    this.handleEvent = function(aEvent) {
        switch (aEvent.type) {
            case com.sppad.BeQuiet.Preferences.EVENT_PREFERENCE_CHANGED:
                this.prefChanged(aEvent.name, aEvent.value);
                break;
            default:
                break;
        }
    };

    this.prefChanged = function(name, value) {
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
    
    this.enablePauseResume = function(enabled) {
    	com.sppad.BeQuiet.Controls.setControlsEnabled(enabled);
    	com.sppad.BeQuiet.Menu.updateToggleButtonState();
		com.sppad.BeQuiet.MediaState.forceOnePlayingHandler();
    };
    
    /**
     * Note: currently requires browser restart in order to change keybinding.
     */
    this.updateKeybind = function(name) {
    	let branch = "shortcut." + name + ".";
    	let modBranch = branch + "modifiers.";
    	
    	let key = prefs[branch + "key"];
    	let enabled = key != '';
    	let modifiers = ['alt', 'shift', 'control', 'meta']
    		.filter(function(mod) { return prefs[modBranch + mod]; })
    		.join(',');
    	
    	let commandNode = document.getElementById(name);
    	
    	if(enabled)
    		commandNode.removeAttribute('disabled');
    	else
    		commandNode.setAttribute('disabled', true);

    	commandNode.setAttribute('key', key);   	
    	commandNode.setAttribute('modifiers', modifiers);
    };

    window.addEventListener('load', function() {
    	com.sppad.BeQuiet.Preferences.addListener(self);
    	
    	let initialPrefs = ['shortcut.com_sppad_mediaToggleState.',
    	                    'shortcut.com_sppad_mediaNext.',
    	                    'shortcut.com_sppad_mediaPrevious.',
    	                    'enablePauseResume'];
    	
    	for(let pref of initialPrefs)
            self.prefChanged(pref, prefs[pref]);	
    });
	

}