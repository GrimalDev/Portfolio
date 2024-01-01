import createError from "http-errors";
import express from "express";
import path from "path";
import {fileURLToPath} from 'url';
import logger from "morgan";
import dotenv from 'dotenv'
import session from './app/config/sessionStore.js'
import {logVisit} from "./app/controllers/logsController.js";
import fileUpload from "express-fileupload";

//session store and authentication
import passport from "passport";
import passportConfig from "./app/config/passport.js";

//route imports
// import examensRouter from "./routes/examens-route.ts";
import homeRouter from "./routes/home-route.ts";
import cvRouter from "./routes/cv-route.js";
import projectsRouter from "./routes/projects-route.ts";
import articlesRouter from "./routes/articles-route.ts";
import contactRouter from "./routes/contact-route.ts";
import veilleRouter from "./routes/veille-router.ts";
import legalRouter from "./routes/legal-route.ts";
import registerRouter from "./routes/register-route.ts";
import loginRouter from "./routes/login-route.ts";
import logoutRouter from "./routes/logout-route.ts";
import adminRouter from "./routes/admin-route.ts";
import sitemapRouter from "./routes/sitemap-route.ts";
import webhooksRouter from "./routes/webhooks-route.ts";

const app = express();
const listeningPort = process.env.PORT || 80;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

//TODO: Report in special DB table all errors displayed with console.error

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//use dev logger when not in production
if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
} else {
  //log route visits to the database
  app.use(logVisit);
  //user loger simple production logger with time
  app.use(logger('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // support encoded bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: process.env.NODE_ENV !== 'production'
  }));

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
// app.use('/examens', examensRouter);
app.use('/contact', contactRouter);
app.use('/veille', veilleRouter);
app.use('/legal', legalRouter);
app.use('/admin', adminRouter);
app.use('/account', loginRouter);
app.use('/account', logoutRouter);
app.use('/account', registerRouter);
app.use('/webhooks', webhooksRouter);
app.use('/libs/threebuild', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/libs/threejsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/sitemap', sitemapRouter);

// catch 404 and forward to error handlerchest-model-v2.usdz
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: { message: any; status: number; }, req: {
  app: {
    get: (arg0: string) => string;
  };
}, res: {
  locals: {
    message: any;
    error: any;
  };
  status: (arg0: any) => void;
  render: (arg0: string) => void;
}, next: any) {
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

app.listen(listeningPort, () => {
  console.log(`App up and running on port ${listeningPort} !`);
})
app.on('error', e => console.error("Error", e));