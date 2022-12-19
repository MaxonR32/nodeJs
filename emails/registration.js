const keys = require('../keys')
let someData = 'data for me'
module.exports = function(email) {
	return {
		to: email, // Sender address
	    from: keys.EMAIL_FROM,         // List of recipients
	    subject: 'Account has created', // Subject line
	    html: `<h1>Have the most fun you can in a car. Get your Tesla today!</h1>
	    	<hr />
	    	<a href="${keys.BASE_URL}">Our site</a>
	    `
	}
}