const {Router} = require('express')
const router = Router()
const Course = require('../models/course')
const auth = require('../middleware/auth')

function mapBasketItems(basket) {
	return basket.items.map(b => ({
		...b.courseId._doc, 
		id: b.courseId.id,
		count: b.count 
	}))
}

function computePrice(courses) {
	return courses.reduce((total, course) => {
		return total += course.price * course.count  
	}, 0)
} 

router.post('/add', auth, async (req, res) => {
	const course = await Course.findById(req.body.id)
	await req.user.addToBasket(course)
	res.redirect('/courses')
})

// await req.user.removeFromBasket(req.params.id)
// 	const user = await req.user.populate('basket.items.productId').execPopulate()
// 	const products = mapBasketItems(user.basket)
// 	const basket = {
// 		products, price: computePrice(products)
// 	}

router.delete('/remove/:id', auth, async (req, res) => {
	await req.user.removeFromBasket(req.params.id)
	const user = await req.user.populate('basket.items.courseId').execPopulate()
	const courses = mapBasketItems(user.basket)
	const basket = {
		courses, price: computePrice(courses)
	}

	res.status(200).json(basket)
})

router.get('/', auth, async (req, res) => {
	const user  = await req.user
		.populate('basket.items.courseId')
		.execPopulate()
console.log(user.basket)
		
	const courses = mapBasketItems(user.basket)
		// console.log(courses);
	res.render('card', {
		title: 'Basket',
		isCard: true,
		courses: courses,
		price: computePrice(courses)
	})

})

module.exports = router