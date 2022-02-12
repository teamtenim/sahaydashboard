const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
require('dotenv').config()

const admin = require('firebase-admin')

const serviceAccount = require('./firebase')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://cuidatushabitos-cth.firebaseio.com'
})

const app = express()
var cors = require('cors')
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE' // what matters here is that OPTIONS is present
	)
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})
app.use(cors())

// Passport Config
require('./config/passport')(passport)

// DB Config
const db = process.env.MONGO_URI

// Connect to MongoDB
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.log(err))

// Express body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Sessions
app.use(
	session({
		secret: 'yooMINET',
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection })
	})
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

// Global variables
app.use((req, res, next) => {
	res.locals.currentUser = req.user
	next()
})

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	next()
})

// Routes
app.use('/api', require('./routes/api.js'))

//404
app.use((res, req, next) => {
	var err = new Error('File not found!')
	err.status = 404
	next(err)
})

//Error Handler
app.use((error, req, res, next) => {
	res.status(500)
	res.render('error')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server started on port ${PORT}`))
