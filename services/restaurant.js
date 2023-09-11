const restaurant = (db) => {

    async function getTables() {
        // get all the available tables
        const getTablesQuery = (`
        SELECT * 
        FROM table_booking;
        `)
        return await db.many(getTablesQuery)
    }

    async function bookTable(tableName) {

        if (!tableName.username) {
            return 'Please enter a username'
        }
        if (!tableName.phoneNumber) {
            return 'Please enter a contact number'
        }


        // book a table by name
        const checkCapacityQuery = (`
        SELECT capacity, booked
        FROM table_booking
        WHERE table_name = $1
        `)

        const tableInfo = await db.one(checkCapacityQuery, [tableName.tableName]);

        const tableCapacity = tableInfo.capacity;

        if (tableCapacity < tableName.seats) {
            return "Seats greater than the table capacity"
        }

        const updateTableQuery = `
        UPDATE table_booking
        SET
        booked = true,
        contact_number = $1,
        number_of_people = $2,
        username = $3
        WHERE table_name = $4
        `;
      

        await db.none(updateTableQuery, [tableName.phoneNumber, tableName.seats, tableName.username, tableName.tableName]);    
        
    }
    async function checkNotBookedTables(tables) {
        const notBookedTables = []
        // get all the not booked tables
        tables.forEach(table => {
            if (table.booked === false) {
                notBookedTables.push(table)
            }
        });
        if (notBookedTables.length === 0) {
            return false
        } else {
            return true
        }
    }

    async function getBookedTables() {
        const getTablesQuery = (`
        SELECT * 
        FROM table_booking;
        `)
        let tables = await db.many(getTablesQuery)
        // get all the booked tables
        const bookedTables = []
        // get all the booked tables
        tables.forEach(table => {
            if (table.booked === true) {
                bookedTables.push(table.tableName)
            }
        });
        return bookedTables
    }

    async function isTableBooked(tableName) {
        // get booked table by name
        const checkCapacityQuery = (`
        SELECT  booked
        FROM table_booking
        WHERE table_name = $1
        `)
        const status = await db.one(checkCapacityQuery, [tableName])
        return status.booked
    }

    async function cancelTableBooking(tableName) {
        // cancel a table by name
        
        const cancelTableQuery = `
        UPDATE table_booking
        SET
        booked = false,
        contact_number = null,
        number_of_people = null,
        username = null
        WHERE table_name = $1
        `;
      
            await db.none(cancelTableQuery, [tableName]);
        
    }

    async function getBookedTablesForUser(username) {
        // get user table booking
        const checkBookingQuery = (`
        SELECT  *
        FROM table_booking
        WHERE username = $1
        `)
        const results = await db.manyOrNone(checkBookingQuery, [username])
        return results
    }

    return {
        getTables,
        bookTable,
        checkNotBookedTables,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
        // editTableBooking,
        getBookedTablesForUser
    }
}

export default restaurant;