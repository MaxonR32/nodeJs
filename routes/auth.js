const {Router} = require('express')
const router = Router()
const nodemailer = require('nodemailer')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const keys = require('../keys')
const crypto = require('crypto')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {validationResult} = require('express-validator')
const validator = require('../utilus/validators')

const transporter = nodemailer.createTransport(
	{
		host: 'smtp.mail.ru',
		port: 465,
		secure: true,
		auth: {
			user: 'nod.emailer@mail.ru',
			pass: 'testing32'
		}
	},
	{
		from: 'nod.emailer@mail.ru'
	}
)

router.get('/login', async (req, res) => {
	res.render('auth/login', {
		title: 'Authorization',
		isLogin: true,
		loginError: req.flash('loginError'),
		registerError: req.flash('registerError')
	})
})

router.get('/logout', async (req, res) => {
	req.session.destroy(() => {
		res.redirect('/auth/login#login')
	})
})

router.post('/login', async (req, res) => {
	try {
		const {email, password} = req.body

		const candidate = await User.findOne({email})

		if(candidate) {
			const areSame = await bcrypt.compare(password, candidate.password)
			if(areSame) {
				req.session.user = candidate
				req.session.isAuthenticated = true
				req.session.save(err => {
					if(err) {
						throw err
					}
					res.redirect('/')			
				})
			} else {
				req.flash('loginError', 'Password is incorectly')
				res.redirect('/auth/login#login')
			}
		} else {
			req.flash('loginError', 'A User with this email do not exists')
			res.redirect('/auth/login#login')
		}
	} catch(e) {
		console.log(e);
	}
})
router.post('/register', validator.registerValidator, async (req, res) => {
	try {		
		const {email, password, name} = req.body
		const errors = validationResult(req)
		
		if(!errors.isEmpty()) {
			req.flash('registerError', errors.array()[0].msg)
			return res.status(402).redirect('/auth/login#register')			
		}
		const hashPassword = await bcrypt.hash(password, 10) // hash password
		const user = new User ({
			email, password: hashPassword, name, basket: {items: []}
		})
		console.log(email);
		await user.save()
		
		res.redirect('/auth/login#login')
		await transporter.sendMail(regEmail(email),  (error, body) => {
			if(error) {
				console.log(error);
			}
			console.log(body);
		})
	} catch(e) {
		console.log(e);
	}
})

router.get('/reset', (req, res) => {
	res.render('auth/reset', {
		title: 'Reset password',
		error: req.flash('error')
	}) 
})

router.post('/reset', (req, res) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if(err) {
				req.flash('error', 'Something went wrong, try again later')
				return res.redirect('/auth/reset')
			}

			const token = buffer.toString('hex')

			const candidate = await User.findOne({email: req.body.email})
			
			if(candidate) {
				candidate.resetToken = token
				candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
				await candidate.save()
				await transporter.sendMail(resetEmail(candidate.email, token))
				res.redirect('/auth/login')
			} else {
				req.flash('error', 'This email not exists')
				res.redirect('/auth/reset')
			}
		})
	} catch(e) {
		console.log(e);
	}
})

router.get('/password/:token', async (req, res) => {
	if(!req.params.token) {
		return res.redirect('/auth/login')
	}

	try {
		const user = await User.findOne({
			resetToken: req.params.token,
			resetTokenExp: {$gt: Date.now()} 
		})
		res.render('auth/password', {
			title: 'Reset password',
			error: req.flash('error'),
			userId: user._id.toString(),
			token: req.params.token
		})
		if(!user) {
			res.redirect('auth/login')
		}
	} catch(e) {
		console.log(e);
	}
})

router.post('/password', async(req, res) => {
	try {
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: {$gt: Date.now()}
		})
		console.log(user.resetTokenExp)
		console.log(Date.now() + 60 * 60 * 1000);
		// console.log(user);

		if(user) {
			user.password = await bcrypt.hash(req.body.password, 10)
			user.resetToken = undefined
			user.resetTokenExp = undefined
			await user.save()
			res.redirect('/auth/login')
		} else {
			req.flash('loginError', 'Time of token expired')
			res.redirect('/auth/login')
		}
	} catch(e) {
		console.log(e);
	}
})


module.exports = router