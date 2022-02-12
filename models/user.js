var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
	name: String,
	password: String,
	address: String,
	email: String,
	username: String,
	phone: Number,
	role: String,
	accountSet: {
		type: Number,
		default: 0
	},
	items: {
		masks: Number,
		remedesivir: Number,
		ppeKits: Number,
		gloves: Number,
		ventilators: Number,
		oxygenCylinder: Number,
		beds: Number,
		pulseOximeters: Number,
		bloodPressureMonitors: Number,
		heartRateMonitors: Number
	},
	medicines: Array,
	blood: Array,
	plasma: Array,
	capacity: {
		current: Number,
		total: Number
	},
	status: {
		requested: {
			type: Number,
			default: 0
		},
		need: String,
		dsc: String
	},
	requests: [
		{
			need: String,
			description: String,
			urgent: Boolean,
			complete: {
				type: Boolean,
				default: false
			}
		}
	]
})

module.exports = mongoose.model('User', UserSchema)
