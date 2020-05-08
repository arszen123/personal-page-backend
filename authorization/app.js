const express = require('express');
const app = express();
const dir = __dirname;
const dotenv = require('dotenv');
dotenv.config();
const hbs = require('express-handlebars');
const session = require('express-session');
const dbMW = require('./utils/db');
const bodyParser = require('body-parser');

const appRouter = require('./routes/app')(getRenderBaseOptions);
const authRouter = require('./routes/auth')(getRenderBaseOptions);
const apiRouter = require('./routes/api')(getRenderBaseOptions);
const authGate = require('./routes/gates/auth-gate');
app.set('view engine', 'mustache');
app.set('views', dir + '/views');

app.engine('mustache', hbs({
  extname: 'mustache',
  defaultView: 'default',
  layout: 'index',
  layoutsDir: dir + '/views/layout/',
  partialsDir: dir + '/views/partial/',
}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(dbMW.createDbConnection);

app.use(authGate);

app.get('/', function(req, res) {
  res.render('index', getRenderBaseOptions(req));
});

app.use('/app', appRouter);
app.use(authRouter);
//  TODO add IP restriction to this endpoints in production
app.use('/api', apiRouter);

app.get('*', function(req, res) {
  res.render('not-found', getRenderBaseOptions(req));
});

function getRenderBaseOptions(req) {
  return {
    isLoggedIn: typeof req.session.user !== 'undefined',
    isNotLoggedIn: typeof req.session.user === 'undefined',
  };
}

app.use(dbMW.closeDbConnection);
app.listen(process.env.PORT);
