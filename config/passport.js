const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')

module.exports = function (passport) {
	passport.use(
		new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
			User.findOne({
				email: email
			}).then((user) => {
				if (!user) {
					return done(null, false, {
						message: 'Email or password incorrect.'
					})
				}

				if (password == user.password) {
					return done(null, user)
				} else {
					console.log('wrong pw')
					return done(null, false, {
						message: 'Email or password incorrect.'
					})
				}
			})
		})
	)

	passport.serializeUser(function (user, done) {
		done(null, user.id)
	})

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user)
		})
	})
}
