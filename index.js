const express = require('express');
const app = express();
const port = 8080;
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')
const initialize = require('./config/passportLocal');

const users = [];
initialize(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}))

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        return res.redirect('/login')
    } catch (error) {
        console.log(error);
        return res.redirect('/register')
    }
})

app.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/login',
    successRedirect: '/' }),
 );

app.delete('/logout', (req, res) => {
    req.logOut(function(err){
        if(err){
            console.log(err);
            return;
        }
        return res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    return next();
}

app.listen(port, function(err){
    if(err){
        console.log(`Error in running the server : ${err}`);
        return;
    }
    console.log(`Successfully running on port : ${port}`)
})