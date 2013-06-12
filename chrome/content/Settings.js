com.sppad.BeQuiet.Settings = new function() {
	
	let self = this;
	
	self.prefs = com.sppad.BeQuiet.CurrentPrefs;

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
        if(name.startsWith('shortcut')) {
        	self.updateKeybind(name.split('\.')[1]);
        }
    };
    
    /**
     * Note: currently requires browser restart in order to change keybinding.
     */
    this.updateKeybind = function(name) {
    	let branch = "shortcut." + name + ".";
    	let modBranch = branch + "modifiers.";
    	
    	let key = self.prefs[branch + "key"];
    	let enabled = key != '';
    	let modifiers = ['alt', 'shift', 'control', 'meta']
    		.filter(function(mod) { return self.prefs[modBranch + mod]; })
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
    	
    	let prefs = ['shortcut.com_sppad_mediaToggleState.',
    	             'shortcut.com_sppad_mediaNext.',
    	             'shortcut.com_sppad_mediaPrevious.'];
    	
        prefs.forEach(function(pref) {
            self.prefChanged(pref, self.prefs[pref]);
        });
    });
	

}