module.exports = {
	ensureAuthenticated: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next()
		}
		res.redirect('/login')
	},

	forwardAuthenticated: function (req, res, next) {
		if (!req.isAuthenticated()) {
			return next()
		}
		res.redirect('/')
	},

	ensureAdmin: function (req, res, next) {
		if (req.user.role == 'admin') {
			return next()
		}
		res.redirect('/')
	}
}
