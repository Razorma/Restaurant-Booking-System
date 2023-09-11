import express from "express";
import pgPromise from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "express-flash";

const app = express()
const pgp = pgPromise();

// Define the database connection string
const connectionString = process.env.DATABASE_URL || 'postgres://xxiqgnir:EAjKP_-otMErlcvMp2ncLGu-yIVzzWs3@tai.db.elephantsql.com/xxiqgnir';


// Connect to the database using pgp
const db = pgp({ connectionString});


app.use(express.static('public'));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

app.get("/", (req, res) => {

    res.render('index', { tables : [{}, {}, {booked : true}, {}, {}, {}]})
});


app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});


var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});