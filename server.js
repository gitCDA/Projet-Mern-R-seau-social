const express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
require('dotenv').config({path: './config/.env'});
require('./config/db');
const {checkUser, requireAuth} = require('./middleware/auth.middleware');
const app = express();

// body parser pr traiter la data qui passe dans les requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// jwt
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
});

// routes
app.use('/api/user', userRoutes);

// server souvent à la fin
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});