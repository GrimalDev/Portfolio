import createError from "http-errors";
import express from "express";
import path from "path";
import {fileURLToPath} from 'url';
import cookieParser from "cookie-parser";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import './app/env.js'

import indexRouter from "./routes/index-route.js";
import cvRouter from "./routes/cv-route.js";
import cvDataRouter from "./routes/cv-data-route.js";
import projectsRouter from "./routes/projects-route.js";
import articlesRouter from "./routes/articles-route.js";
import docRouter from "./routes/doc-route.js";
import adminRouter from "./routes/admin-route.js";
import loginRouter from "./routes/login-route.js";
import logoutRouter from "./routes/logout-route.js";
import newcvlineRouter from "./routes/newcvline-route.js";

const app = express();
const listeningPort = 80
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// For Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized:true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use('/', indexRouter);
app.use('/cv', cvRouter);
app.use('/getcvdata', cvDataRouter);
app.use('/projects', projectsRouter);
app.use('/articles', articlesRouter);
app.use('/doc', docRouter);
app.use('/admin', adminRouter);
app.use('/newcvline', newcvlineRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/threebuild', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/threejsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// catch 404 and forward to error handlerchest-model-v2.usdz
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
  if (err) { throw err }
  console.log(`App up and running on port ${listeningPort} !`);
})
