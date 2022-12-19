const {Schema, model} = require('mongoose')

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	name: String,
	password: {
		type: String,
		reuired: true
	},
	avatarUrl: String,
	resetToken: String,
	resetTokenExp: Date,
	basket: {
		items: [
			{
				count: {
					type: Number,
					required: true,
					default: 1
				},
				courseId: {
					type: Schema.Types.ObjectId,
					ref: 'Course',
					required: true
				}
			}
		]
	}
})

userSchema.methods.addToBasket = function(course) {
	const items = [...this.basket.items]
	const idx = items.findIndex(c => {
		return c.courseId.toString() === course._id.toString()
	})

	if(idx >= 0) {
		items[idx].count = items[idx].count + 1
	} else {
		items.push({
			courseId: course._id,
			count: 1
		})
	}

	// const newBasket = {items: clonedItems}
	// this.basket = newBasket

	this.basket = {items}
	console.log(this);
	return this.save()

	// console.log(this);
}

userSchema.methods.removeFromBasket = function(id) {
	let items = [...this.basket.items]
	const idx = items.findIndex(b => b.courseId.toString() === id.toString())

	if(items[idx].count === 1) {
		items = items.filter(b => b.courseId.toString() !== id.toString())
	} else {
		items[idx].count--
	}

	this.basket = {items}

	return this.save()

}


userSchema.methods.clearBasket = function() {
	this.basket = {items: []}
	return this.save()
}


module.exports = model('User', userSchema)