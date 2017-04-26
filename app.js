require('app-module-path').addPath(__dirname);
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var apps = require('routes/index');
var Q = require('q');
Q.longStackSupport = true;
var app = express();
var http = require('http');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var session = require('express-session');
app.use(session({
    cookie: {
        httpOnly: false,
        maxAge: 60 * 60 * 1000,
        secure: true
    },
    name: 'payallmoney',
    secret: 'payallmoney2016',
    resave: false,
    saveUninitialized: true,
}));




//app.use(express.static(path.join(__dirname, 'public')));

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// catch 404 and forward to error handler

//处理登录 放在前面的不需要登录 , 后面的需要
app.use(function(req, res, next) {
    //console.log(JSON.stringify(req._parsedUrl));
    var pathname = req._parsedUrl.pathname;
    console.log(pathname);
    var authpass = require('utils/noauth.js').pass;
    var cfg = require("conf/conf.js");
    if (authpass(pathname)) {
        return next();
    }
    if (req.session.user_id) {
        req.session._garbage = Date();
        req.session.touch();
        return next();
    }
    //判断如果是json , 则返回json , 如果是jsonp , 则返回jsonp
    console.dir(apps);
    res.json({ "success": false, msg: '未登录!' })
});

app.use('/', apps);


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: "系统异常!请与系统管理员联系!",
        error: {}
    });
});


module.exports = app;