const {body, validationResult} = require('express-validator')
const User = require('../models/user')

exports.registerValidator = [
	body('email').isEmail().withMessage('Write correct email').custom(async (value, {req}) => {
		try {
			const user = await User.findOne({email: value})
			if(user) {
				return Promise.reject('This email already exists')
			}
		} catch(e) {
			console.log(e);
		}
	}).normalizeEmail(),
	body('password', 'Password must have a least 6 symbols')
		.isLength({min: 6, max: 56}).isAlphanumeric().trim(),
	body('confirm').custom((value, {req}) => {
		if(value !== req.body.password) {
			throw new Error('Passwords must match')
		}

		return true
	}).trim(),
	body('name').isLength({min: 3}).withMessage('Name must have a least 3 symbols').trim()
]


exports.courseValidator = [
	body('title').isLength({min: 3}).withMessage('Min 3 symbols for title').trim(),
	body('price').isNumeric().withMessage('Type normal price'),
	body('img', 'Write corect Url of img').isURL()
] 
	