module.exports = {
	ifeq(a, b, options) { // if equals
		console.log(typeof a, b);
		if( a == b) {
			return options.fn(this)
		}

		return options.inverse(this)
	} 
}