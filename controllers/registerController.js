const Cookies = require("cookies");
const keys = ['keyboard cat']

exports.register = (req,res) => {
    checkLogged(req,res);
    res.render('register');
}

exports.postPassword = (req,res) => {
    checkLogged(req,res);
    // creates a cookie for 1 minute, saving the user's name and email.
    const cookies = new Cookies(req, res, {keys: keys})
    const {email, firstName, lastName} = req.body;
    let data = firstName + " " + lastName + " " + email;
    cookies.set('data', data, {signed: true, maxAge: 60 * 1000});
    res.render('password', {error: false, outline: 'transparent'});
}

exports.getPassword = (req,res) => {
    checkLogged(req,res);
    //check if there was a failure while trying to register the new password, if so show relevant error message
    const cookies = new Cookies(req, res, {keys: keys})
    let failedPass = cookies.get('failedPassword', {signed: true});
    if (failedPass)
        res.render('password', {error: true, outline: 'red'});
    res.redirect('/register'); // tried to reach this page by writing the url
}

const checkLogged = (req, res) =>{
    if(req.session.logged === true)
        res.redirect('/');
}