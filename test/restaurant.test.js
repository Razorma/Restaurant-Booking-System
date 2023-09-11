import assert from "assert"
import RestaurantTableBooking from "../services/restaurant.js";
import pgPromise from 'pg-promise';

const DATABASE_URL = 'postgres://xxiqgnir:EAjKP_-otMErlcvMp2ncLGu-yIVzzWs3@tai.db.elephantsql.com/xxiqgnir';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgPromise()(connectionString);

describe("The restaurant booking table", function () {
    this.timeout(5000);
    beforeEach(async function () {
        try {
            // clean the tables before each test run
            await db.none("TRUNCATE TABLE table_booking RESTART IDENTITY CASCADE;");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table one', 4, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table two', 6, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table three', 4, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table four', 2, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table five', 6, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table six', 4, false);");
        } catch (err) {
            console.log(err);
            throw err;
        }
    });

    it("Get all the available tables", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);

        assert.deepEqual([ {
            booked: false,
            capacity: 4,
            contact_number: null,
            id: 1,
            number_of_people: null,
            table_name: 'Table one',
            username: null
          },
          {
            booked: false,
            capacity: 6,
            contact_number: null,
            id: 2,
            number_of_people: null,
            table_name: 'Table two',
            username: null
          },
          {
            booked: false,
            capacity: 4,
            contact_number: null,
            id: 3,
            number_of_people: null,
            table_name: 'Table three',
            username: null
          },
         {
            booked: false,
            capacity: 2,
            contact_number: null,
            id: 4,
            number_of_people: null,
            table_name: "Table four",
            username: null
        }, {
            booked: false,
            capacity: 6,
            contact_number: null,
            id: 5,
            number_of_people: null,
            table_name: "Table five",
            username: null
        }, {
            booked: false,
            capacity: 4,
            contact_number: null,
            id: 6,
            number_of_people: null,
            table_name: "Table six",
            username: null,
        }], await restaurantTableBooking.getTables());
    });


    it("Should check that the seats requested should not be greater than capacity of the table.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);

        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 3
        });

        assert.deepEqual("Seats greater than the table capacity", result);
    });

    it("should check if there are available seats for a booking.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);

        // get all the tables
        const tables = await restaurantTableBooking.getTables()
        // loop over the tables and see if there is a table that is not booked
        const avalabletableCheck = await restaurantTableBooking.checkNotBookedTables(tables)

        assert.deepEqual(true, avalabletableCheck);
    });

    it("Check if the booking has a user name provided.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        assert.deepEqual("Please enter a username", await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            phoneNumber: '084 009 8910',
            seats: 2
        }));
    });

    it("Check if the booking has a contact number provided.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        assert.deepEqual("Please enter a contact number", await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            username: 'Kim',
            seats: 2
        }));
    });

    it("should not be able to book a table with an invalid table name.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        let message = ''
        try {
        await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });
       } catch (error) {
        if(error.message.includes('No data returned from the query') ){
            message = "Invalid table name provided"
        }
       }
       assert.deepEqual("Invalid table name provided", message);
    });

    it("should be able to book a table.", async function () {
        let restaurantTableBooking = RestaurantTableBooking(db);
        // Table three should not be booked
        assert.equal(false, await restaurantTableBooking.isTableBooked('Table three'));
        // book Table three

        await restaurantTableBooking.bookTable({
            tableName: 'Table three',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        // Table three should be booked now
        const booked = await restaurantTableBooking.isTableBooked('Table three')
        assert.equal(true, booked);
    });

    it("should list all booked tables.", async function () {
        let restaurantTableBooking = RestaurantTableBooking(db);
        let tables = await restaurantTableBooking.getBookedTables();
        assert.deepEqual(0, tables.length);
    });

    it("should allow users to book tables", async function () {
        let restaurantTableBooking = await RestaurantTableBooking(db);

        assert.deepEqual([], await restaurantTableBooking.getBookedTablesForUser('jodie'));

        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 4
        });

        await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 4
        })

        // should only return 2 bookings as two of the bookings were for the same table
        const bookedTables = await restaurantTableBooking.getBookedTablesForUser('Jodie')
        assert.deepEqual([
            
            {
              booked: true,
              capacity: 2,
              contact_number: '084 009 8910',
              id: 4,
              number_of_people: 2,
              table_name: 'Table four',
              username: 'Jodie'
            },
            {
              booked: true,
              capacity: 6,
              contact_number: '084 009 8910',
              id: 5,
              number_of_people: 4,
              table_name: 'Table five',
              username: 'Jodie'
            }
          ]
          , bookedTables );
    });

    it("should be able to cancel a table booking", async function () {
        let restaurantTableBooking = await RestaurantTableBooking(db);
       
        await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });
  
   
    await restaurantTableBooking.bookTable({
        tableName: 'Table five',
        username: 'Jodie',
        phoneNumber: '084 009 8910',
        seats: 4
    });
        

        let bookedTables = await restaurantTableBooking.getBookedTables();
        assert.equal(2, bookedTables.length);

        await restaurantTableBooking.cancelTableBooking('Table four');

        bookedTables = await restaurantTableBooking.getBookedTables();
        assert.equal(1, bookedTables.length);
    });

    after(function () {
        db.$pool.end;
    });
})
