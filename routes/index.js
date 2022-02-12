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
