const {Router} = require('express')
const router = Router()
const Course = require('../models/course')
const auth = require('../middleware/auth')
const {validationResult} = require('express-validator')
const validator = require('../utilus/validators')

function isOwner(course, req) {
	return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
	try {
		const courses = await Course.find()
		.populate('userId', 'email name')
		.select('price title img')

		res.render('courses', {
			title: 'Courses page',
			isCourses: true,
			userId: req.user ? req.user._id.toString() : null, // controlam daca e autentificat
			courses
		})
	} catch(e) {
		console.log(e);
	}
	
})

router.get('/:id/edit', auth,  async(req, res) => {
	if(!req.query.allow) {
		return res.redirect('/')
	}

	try {
		const course = await Course.findById(req.params.id)

		if(!isOwner(course, req)) {
			return res.redirect('/courses')
		}

		res.render('course-edit', {
			title: `Redact ${course.title}`,
			course
		})
	} catch(e) {
		console.log(e);
	}

	
})

router.post('/edit', auth, validator.courseValidator, async (req, res) => {

	const errors = validationResult(req)

	if(!errors.isEmpty()) {
		return res.status(422).redirect(`/courses/${id}edit?allow=true`)
	}
	try {
		const {id} = req.body
		delete req.body.id 
		const course = await Course.findById(id)
		if(!isOwner(course, req)) {
			res.redirect('/courses')
		}
		Object.assign(course, req.body)
		await course.save()
		res.redirect('/courses')	
	} catch(e) {
		console.log(e);
	}
	
})

// get certain course
router.get('/:id', async (req, res) => {
	try {
		const course = await Course.findById(req.params.id) // trimitem id pentru control
		res.render('course', {
			layout: 'empty',
			title: `Course ${course.title}`,
			course
		})
	} catch(e) {
		console.log(e);	
	}
	
})
// remove
router.post('/remove', auth, async(req, res) => {
	try {
		await Course.deleteOne({
			_id: req.body.id,
			userId: req.user._id
		})
		res.redirect('/courses')
	} catch (e) {
		console.log(e);
	}

})


module.exports = router