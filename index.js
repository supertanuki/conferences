const bodyParser = require('body-parser')
const express = require('express')
const flash = require('connect-flash')
const path = require('path')
const session = require('express-session')

const config = require('./config')
const conferences = require('./lib/conferences')
const createConfController = require('./controllers/createConfController')
const urls = require('./urls')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/static', express.static('static'))
// Hack for importing css from npm package
app.use('/~', express.static(path.join(__dirname, 'node_modules')))
app.use(bodyParser.urlencoded({ extended: false }));
// Session is necessary for flash.
app.use(session({
  // todo : chose a prod-appropriate store, the default MemoryStore has memoryleaks and other problems.
  secret: 'aaaa',
  resave: false,
  saveUninitialized: false, // "complying with laws that require permission before setting a cookie"
  cookie: {
    maxAge: 300000,
    sameSite: 'lax' // todo strict would be better for prod
  } }));
app.use(flash())
// Populate some variables for all views
app.use(function(req, res, next){
  res.locals.appName = config.APP_NAME
  res.locals.errors = req.flash('error')
  res.locals.message = req.flash('message')
  res.locals.urls = urls
  next()
})

app.get(urls.landing, (req, res) => {
  res.render('landing', {
    NUM_PIN_DIGITS: config.NUM_PIN_DIGITS,
  })
})

app.post(urls.createConf, createConfController.createConf)

app.get(urls.confCreated, (req, res) => {
  res.render('confCreated', {
    email: req.query.email
  })
})

app.get(urls.legalNotice, (req, res) => {
  res.render('legalNotice')
})


module.exports = app.listen(config.PORT, () => {
  console.log(`${config.APP_NAME} listening at http://localhost:${config.PORT}`)
})
