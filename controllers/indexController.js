const db = require('../models');
const Cookies = require("cookies");
const keys = ['keyboard cat']

const successfulRegistration = 'Thank you for your registration!',
      failedRegistration = 'Oops! It seems you are already in the system! Please sign in',
      failedLoginError = 'Email and password did not match';

exports.getIndex = (req,res) => {
    //only logged users can reach the index page
    if(req.session.logged === true)
        res.render('index', {firstName: req.session.firstName});
    res.redirect('/login');
};

exports.postIndex = (req,res) => {
    // can reach this page by clicking submit in the login page
    const {email, password} = req.body;
    db.User.findOne({where: {email: email, password: password}}) // check if the user is in the data base
        .then(function (user) {
            if (!user) // there is no user with these email and password
            {
                const cookies = new Cookies(req, res, {keys: keys});
                cookies.set('failedLogin', true, {signed: true, maxAge: 1000});
                res.redirect('/login');
            }
            else // creating a session with the user's information
            {
                req.session.firstName = user.firstName;
                req.session.email = user.email;
                req.session.logged = true;
                res.render('index', {firstName: req.session.firstName});
            }
        });
};

exports.postLogin = (req,res) => {
    // can reach this page by clicking submit in the password page
    checkLogged(req, res);
    const {password1, password2} = req.body;

    const cookies = new Cookies(req, res, {keys: keys})
    let exist = cookies.get('data', {signed: true});

    if (!exist) // the cookie expired
    {
        res.redirect('/register');
    }
    else if (password1 !== password2) // shows the last page with a relevant error message
    {
        cookies.set('failedPassword', true, {signed: true, maxAge: 1000});
        res.redirect('/register/password');
    }
    else {
        let u = exist.split(' ');
        let firstName, lastName, email, password;
        [firstName, lastName, email, password] = [u[0], u[1], u[2], password1];
        return db.User.findOne({where: {email: email}}) // check again if the email is not in the db.
            .then(function (user) {
                if (!user) // email is not in data base
                {
                    db.User.create({firstName, lastName, email, password})
                        .then(() => res.render('login', {msg: successfulRegistration, failedMsg: ''}))
                        .catch((err) => {
                            res.redirect('/register');
                        })
                } else // email is in the data base
                    res.render('login', {msg: failedRegistration, failedMsg: ''})
            });
    }
}

exports.getLogin = (req,res) => {
    checkLogged(req, res);
    // check if the user had a failed login and if so display a relevant error message
    const cookies = new Cookies(req, res, {keys: keys});
    let exist = cookies.get('failedLogin', {signed: true});
    if (exist)
        res.render('login', {msg: '', failedMsg: failedLoginError});

    res.render('login', {msg: '', failedMsg: ''}); // the user reached here by typing the url
}

exports.logout = (req,res) => {
    req.session.logged = false;
    res.redirect('/login');
}

const checkLogged = (req, res) =>{
    if(req.session.logged === true)
        res.redirect('/');
}




