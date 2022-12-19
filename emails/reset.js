const keys = require('../keys')
let a = 9;
module.exports = function(email, token) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: 'Reset Passworwd',
		html: ` 
			<h1>You forgot password?</h1>
			<p>If no, ingore this message</p>
			<p>Else click on the link: </p>
			<p><a href="${keys.BASE_URL}/auth/password/${token}">Reset password</a></p>
		`
	}
}
