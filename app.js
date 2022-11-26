const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config()

const indexRouter = require('./routes/index-route');
const cvRouter = require('./routes/cv-route');
const cvDataRouter = require('./routes/cv-data-route')
const projectsRouter = require('./routes/projects-route');
const articlesRouter = require('./routes/articles-route');
const docRouter = require('./routes/doc-route');
const {con} = require("./app/configDB");

const app = express();
const listeningPort = 3030

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/cv', cvRouter);
app.use('/getcvdata', cvDataRouter);
app.use('/projects', projectsRouter);
app.use('/articles', articlesRouter);
app.use('/doc', docRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(listeningPort, (err) => {
  if (err) { throw err };
  console.log(`App up and running on port ${listeningPort} !`);
})
