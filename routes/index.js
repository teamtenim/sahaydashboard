const express = require('express')
const router = express.Router()
const {
	ensureAuthenticated,
	forwardAuthenticated,
	ensureAdmin
} = require('../config/auth')
const passport = require('passport')
const User = require('../models/user')
const admin = require('firebase-admin')

// Dashboard
router.get('/', ensureAuthenticated, (req, res) => {
	if (!req.user.accountSet) {
		return res.render('set')
	} else {
		return res.render('dashboard')
	}
})

router.get('/view', (req, res) => {
	User.find({}, function (err, users) {
		if (err) {
			console.log(err)
		}
		reqArray = []
		// console.log(users)
		users.forEach((user) => {
			newbro = []
			user.requests.forEach((request) => {
				var data = {}
				data.reqdata = request
				data.user = {}
				data.user.email = user.email
				data.user.name = user.name
				data.user.address = user.address
				data.user.id = user._id
				newbro.push(data)
				// console.log(data)
				reqArray.push(data)
			})
		})

		return res.render('view', { users: reqArray })
		// return res.send(reqArray)
	})
})

router.post('/request', ensureAuthenticated, async (req, res) =>
	User.findById(req.user.id, function (err, user) {
		user.status.requested = 1
		user.status.need = req.body.request
		user.status.dsc = req.body.dsc

		user.save()

		req.flash('success_msg', 'Global request sent successfully.')
		return res.redirect('/view')
	})
)

router.post('/add-request', ensureAuthenticated, async (req, res) =>
	User.findById(req.user.id, function (err, user) {
		var newArray = user.requests
		var reqbro = {}
		reqbro.urgent = req.body.urgent
		reqbro.need = req.body.request
		reqbro.description = req.body.dsc
		newArray.push(reqbro)
		console.log(newArray)
		user.requests = newArray
		user.save()
		// console.log(req.body)

		req.flash('success_msg', 'Global request sent successfully.')
		return res.redirect('/view')
	})
)

router.post('/del-request', ensureAuthenticated, async (req, res) =>
	User.findById(req.user.id, function (err, user) {
		user.status.requested = 0
		user.status.need = ''

		user.save()

		req.flash('success_msg', 'Request deleted successfully')
		return res.redirect('/view')
	})
)

router.post('/set', ensureAuthenticated, async (req, res) =>
	User.findById(req.user.id, function (err, user) {
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

		req.flash('success_msg', 'Account details set.')
		return res.redirect('/')
	})
)

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
	return res.render('login')
})

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
	return res.render('register')
})

router.get('/edit', ensureAuthenticated, (req, res) => {
	return res.render('edit')
})

router.post('/edit', (req, res) => {
	User.findById(req.user.id, function (err, user) {
		user.email = req.body.email
		user.username = req.body.username
		user.save()
	})
})

// Register Post
router.post('/register', (req, res) => {
	User.findOne({ username: req.body.username }).then((user) => {
		if (user) {
			return res.render('register', {
				msg: 'This user is not available.',
				username: req.body.username,
				name: req.body.name,
				password: req.body.password,
				address: req.body.address,
				email: req.body.email,
				phone: req.body.pNumber
			})
		} else {
			var userData = {
				name: req.body.name,
				username: req.body.username,
				email: req.body.email,
				address: req.body.address,
				password: req.body.password,
				phone: req.body.pNumber
			}

			admin
				.auth()
				.createUser({
					email: req.body.email,
					password: req.body.password
				})
				.then(function (userRecord) {
					User.create(userData, (error, user) => {
						if (error) {
							console.log(error)
							return res.send('error occured')
						}
					})
					console.log('Successfully created new user:', userRecord.uid)
					req.flash('success_msg', 'Account creation successful.')
					return res.redirect('/login')
				})
				.catch(function (error) {
					console.log('Error creating new user:', error)
				})
		}
	})
})

// Login
router.post('/login', (req, res, next) => {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			return next(err)
		}
		if (!user) {
			return res.render('login', { message: info.message })
		}
		req.logIn(user, function (err) {
			if (err) {
				return next(err)
			}
			return res.redirect('/')
		})
	})(req, res, next)
})

// Logout
router.get('/logout', (req, res) => {
	req.logout()
	req.flash('success_msg', 'You are logged out')
	res.redirect('/login')
})

module.exports = router
