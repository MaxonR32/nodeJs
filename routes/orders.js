const {Router} = require('express')
const router = Router()
const Order = require('../models/order')
const auth = require('../middleware/auth')
const {validationResult} = ('express-validator')
const validator = require('../utilus/validators')

router.get('/', auth, async (req, res) => {
	try {
		const orders = await Order.find({'user.userId': req.user._id})
			.populate('user.userId')

		res.render('orders', {
			isOrders: true,
			title: 'Orders',
			orders: orders.map(o => {
				return{
					...o._doc,
					price: o.courses.reduce((total, c) => {
						return total += c.count * c.course.price
					}, 0)
				}
			})
		})	
	} catch (e) {
		console.log(e);
	}

	
})

router.post('/', auth, validator.courseValidator, async (req, res) => {
	try {
		const user = await req.user
			.populate('basket.items.courseId')
			.execPopulate()


		const courses = user.basket.items.map(i => ({
			count: i.count,
			course: {...i.courseId._doc}
		}))
		console.log(user.basket.items);

		const order = new Order({
			user: {
				name: req.user.name,
				userId: req.user
			},
			courses: courses,
		})
		await order.save()
		await req.user.clearBasket()

		res.redirect('/orders')
	} catch(e) {
		console.log(e);
	}
	
})


module.exports = router