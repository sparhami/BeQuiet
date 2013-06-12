com.sppad.collect.SetMultiMap = function() {

	let self = this;
	self.backingMap = new Map();

	this.clear = function() {
		self.backingMap.clear();
	};
	
	this.containsKey = function(key) {
		return self.backingMap.has(key);
	};
	
	this.containsValue = function(value) {
		for(let element of self.values())
			if(element == value)
				return true;
		
		return false;
	};
	
	this.get = function(key) {
		return self.backingMap.get(key) || new Set();
	};
	
	this.keys = function() {
		return self.backingMap.keys();
	};
	
	this.put = function(key, value) {
		if(!self.backingMap.has(key))
			self.backingMap.set(key, new Set());
		
		self.backingMap.get(key).add(value);
	};

	this.remove = function(key, value) {
		if(!self.backingMap.has(key))
			return;
		
		let set = self.backingMap.get(key);
		set.delete(value);
		
		if(set.size == 0)
			self.backingMap.delete(set);
	};
	
	this.removeAll = function(key) {
		self.backingMap.delete(key);
	};
	
	this.size = function() {
		let count = 0;
		
		for (let set of self.backingMap.values())
			count += set.size;
		
		return count;
	};

	this.values = function() {
		for (let set of self.backingMap.values())
			for(let value of set)
				yield value;
	};
};