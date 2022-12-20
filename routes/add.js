const { Router } = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()
const { validationResult } = require('express-validator')
const validator = require('../utilus/validators')

router.get('/', auth, (req, res) => {
	res.render('add', {
		title: 'Add page',
		isAdd: true
	})
})

router.post('/', auth, validator.courseValidator, async (req, res) => {
	const errors = validationResult(req)

	console.log('this is new data')

	if(!errors.isEmpty()) {
		return res.status(422).render('add', {
			title: 'Add page',
			isAdd: true,
			error: errors.array()[0].msg,
			data: {
				title: req.body.title,
				price: req.body.price,
				img: req.body.img,
			}
		})
	}

	const course = new Course({
		title: req.body.title,
		price: req.body.price,
		img: req.body.img,
		userId: req.user
	})
	try {
		await course.save()
		
		res.redirect('/courses')
	} catch(e) {
		console.log(e);
	}


})

module.exports = router