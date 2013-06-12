com.sppad.collect.Iterable = function(iterator) {

	let self = this;
	
	self.iterator = iterator;
	
	
	/**
	 * @param predicate
	 *            A function returns true if the item should be included
	 */
	this.filter = function(predicate) {
		return new com.sppad.collect.Iterable(new function() {
			for(let item of self.iterator)
				if(predicate(item))
					yield item;
		});
	};
	
	
	/**
	 * @param func
	 *            A function that maps an input parameter to an output parameter
	 */
	this.map = function(func) {
		return new com.sppad.collect.Iterable(new function() {
			for(let item of self.iterator)
				yield func(item);
		});
	};
	
	/**
	 * @param func
	 *            A function(current, previous) that performs a reduction over
	 *            the iterator
	 */
	this.reduce = function(func) {
		try {
			let previous = self.iterator.next();
			
			for(let current of self.iterator)
				previous = func(previous, current);
			
			return previous;
		} catch(e) {
			if (e instanceof StopIteration) {
				return undefined;			// There was nothing to reduce
			} else {
				throw e;
			}
		}
	};

	/**
	 * @param comparator
	 *            A function(a, b) that returns less than 0, 0 or greater than 0
	 *            as a is less than, equal to or greater than b
	 */
	this.max = function(comparator) {
		return self.reduce(function (previous, current) {
			return comparator(previous, current) > 0 ? previous : current;
		});
	};
	
	/**
	 * @param comparator
	 *            A function(a, b) that returns less than 0, 0 or greater than 0
	 *            as a is less than, equal to or greater than b
	 */
	this.min = function(comparator) {
		return self.reduce(function (previous, current) {
			return comparator(previous, current) < 0 ? previous : current;
		});
	};
	
	/**
	 * @return An array containing the items in the iterator
	 */
	this.toArray = function() {
		let items = [];
		
		for(let item of self.iterator)
			items.push(item);
		
		return items;
	};
	
	/**
	 * @return A Set containing the items in the iterator
	 */
	this.toSet = function() {
		return new Set(self.iterator);
	};
}