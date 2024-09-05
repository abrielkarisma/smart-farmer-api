var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/user');
var authRouter = require('../routes/auth');
var kandangRouter = require('../routes/kandang');
var inventoryRouter = require("../routes/inventory");

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/auth', authRouter);
app.use('/kandang', kandangRouter);
app.use("/inventory", inventoryRouter);

module.exports = app;
