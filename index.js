import express from "express";
import pgPromise from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "express-flash";
import session from 'express-session';
import restaurant from "./services/restaurant.js";

const app = express()
const pgp = pgPromise();

// Define the database connection string
const connectionString = process.env.DATABASE_URL || 'postgres://pxbgzzyy:piE6ujNBwCAXztEJG34GEYmdNm1-hNg6@mel.db.elephantsql.com/pxbgzzyy';


// Connect to the database using pgp
const db = pgp({ connectionString});


const restaurantService = restaurant(db)
app.use(session({ 
    secret: 'Razorma', 
    resave: false,
    saveUninitialized: true,
  }));

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

app.get("/", async (req, res) => {
   const tables = await restaurantService.getTables()
   

    res.render('index', { tables})
});
app.post("/book", async (req, res) => {
    const {booking_size,username,phone_number,tableId} = req.body
     
    req.flash('error', await restaurantService.bookTable({
        tableName: tableId,
        username: username,
        phoneNumber: phone_number,
        seats: booking_size
    }))
     res.redirect('/')
 });

 app.get("/bookings", async (req, res) => {
   
    const tables = await restaurantService.getTables()
    res.render('bookings',{ tables})
 });
//  app.post("/cancel", async (req, res) => {
//     const {cancelDay} = req.body
//     console.log(cancelDay)
//     await restaurantService.cancelTableBooking(cancelDay)
//     const tables = await restaurantService.getTables()
     
//     res.render('index', { tables})
//  });


app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});


var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});