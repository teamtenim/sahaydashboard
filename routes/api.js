const express = require('express')
const router = express.Router()
const User = require('../models/user')

//get all hospitals
router.get('/hospitals', (req, res) => {
	User.find({}, { password: 0 }).then((users) => {
		return res.send(users)
	})
})

//get a specific hospital
router.get('/user', (req, res) => {
	console.log(req.headers)
	User.find({ email: req.headers.email }, { password: 0 }).then(
		(specificUser) => {
			return res.send(specificUser)
		}
	)
})

//request for help
router.post('/request', (req, res) => {
	// console.log(req.headers.email)
	User.findOne({ email: req.headers.email }, function (err, user) {
		if (err) {
			console.log(err)
		}
		// user.status.requested = 1
		// user.status.need = req.body.request
		// user.status.dsc = req.body.dsc
		var newArray = user.requests
		newArray.push(req.body.request)
		console.log(newArray)
		user.requests = newArray
		user.save()

		return res.send('Global request sent successfully.')
	})
})

//get all requests
router.get('/allreqs', (req, res) => {
	User.find({}, function (err, users) {
		if (err) {
			console.log(err)
		}
		reqArray = []
		// console.log(users)
		users.forEach((user) => {
			newbro = []
			user.requests.forEach((request) => {
				if (request.complete) {
				} else {
					var data = {}
					data.reqdata = request
					data.user = {}
					data.user.email = user.email
					data.user.id = user._id
					data.user.name = user.name
					data.user.address = user.address
					newbro.push(data)
					console.log(data)
					reqArray.push(data)
				}
			})
		})

		return res.send(reqArray)
	})
})

//Delete request
router.get('/del-request', async (req, res) => {
	if (req.query.userid && req.query.requestid) {
		User.findById(req.query.userid, function (err, user) {
			if (err) {
				console.log(err)
			}

			user.requests.forEach((r) => {
				if (r._id == req.query.requestid) {
					r.complete = true
				}
			})

			user.save()

			return res.send({ msg: 'Request deleted successfully.' })
		})
	} else {
		return res.status(500).send({ msg: 'Insuffiecient Data.' })
	}
})

//register users to mongo
router.post('/register', (req, res) => {
	User.findOne({ username: req.body.username }).then((user) => {
		var userData = {
			name: req.body.name,
			email: req.body.email,
			address: req.body.address,
			password: req.body.password,
			phone: req.body.pNumber
		}

		User.create(userData, (error, user) => {
			if (error) {
				console.log(error)
				return res.status(500).send('an error occured')
			}
		})
	})

	return res.send('User registered successfully.')
})

//set hospital details
router.post('/set', async (req, res) =>
	User.findOne({ email: req.headers.email }, function (err, user) {
		if (err) {
			return res.status(500).send(err)
		}

		user.capacity.current = req.body.current
		user.capacity.total = req.body.max

		user.items.masks = req.body.masks
		user.items.remedesivir = req.body.remedesivir
		user.items.ppeKits = req.body.ppeKits
		user.items.gloves = req.body.gloves
		user.items.ventilators = req.body.ventilators
		user.items.oxygenCylinder = req.body.oxygenCylinder
		user.items.beds = req.body.beds
		user.items.pulseOximeters = req.body.pulseOximeters
		user.items.bloodPressureMonitors = req.body.bloodPressureMonitors
		user.items.heartRateMonitors = req.body.heartRateMonitors

		user.accountSet = 1

		user.save()

		return res.send('Account details set.')
	})
)

router.post('/meds', async (req, res) =>
	User.findOne({ email: req.headers.email }, function (err, user) {
		if (err) {
			return res.status(500).send(err)
		}
		if (!user) {
			return res.status(500).send('user not found')
		}
		console.log(req.headers.email)
		user.plasma = req.body.plasma
		user.blood = req.body.blood
		user.medicines = req.body.medicines

		user.save()

		return res.send('Account details set.')
	})
)

module.exports = router
