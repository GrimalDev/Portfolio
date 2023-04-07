import createError from "http-errors";
import express from "express";
import path from "path";
import {fileURLToPath} from 'url';
import logger from "morgan";
import dotenv from 'dotenv'
import session from './app/config/sessionStore.js'

//session store and authentication
import passport from "passport";
import passportConfig from "./app/config/passport.js";

//route imports
import homeRouter from "./routes/home-route.js";
import cvRouter from "./routes/cv-route.js";
import projectsRouter from "./routes/projects-route.js";
import articlesRouter from "./routes/articles-route.js";
import examensRouter from "./routes/examens-route.js";
import contactRouter from "./routes/contact-route.js";
import veilleRouter from "./routes/veille-router.js";

import registerRouter from "./routes/register-route.js";
import loginRouter from "./routes/login-route.js";
import logoutRouter from "./routes/logout-route.js";
import adminRouter from "./routes/admin-route.js";
import {logVisit} from "./app/controllers/logsController.js";

const app = express();
const listeningPort = 80
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//use dev logger when not in production
if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
} else {
  //log route visits
  app.use(logVisit);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // support encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

// Sessions for Passport
app.use(session) // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//passport initialization
passportConfig();

//routes
app.use('/', homeRouter);
app.use('/cv', cvRouter);
app.use('/projects', projectsRouter);
app.use('/articles', articlesRouter);
app.use('/examens', examensRouter);
app.use('/contact', contactRouter);
app.use('/veille', veilleRouter);
app.use('/admin', adminRouter);
app.use('/account', loginRouter);
app.use('/account', logoutRouter);
app.use('/account', registerRouter);
app.use('/libs/threebuild', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/libs/threejsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

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

  //if the error is a 404, render the 404 page
  if (err.status === 404) {
      res.render('not-found');
  } else {
      res.render('error');
  }
});

app.listen(listeningPort, (err) => {
  if (err) { throw err }
  console.log(`App up and running on port ${listeningPort} !`);
})
