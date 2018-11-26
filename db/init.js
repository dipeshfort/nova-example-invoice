#!/usr/bin/env node
require('dotenv').config();
const pg = require('pg');

const TABLE_NAME = "invoices";

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.query(`
    DROP TABLE IF EXISTS ${TABLE_NAME};
    CREATE TABLE ${TABLE_NAME} (
        id UUID NOT NULL PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        comments TEXT,
        amount float8 NOT NULL,
        remind_date TIMESTAMP NOT NULL,
        created TIMESTAMP DEFAULT current_timestamp,
        status VARCHAR(10)
    );
`).then((operationResult) => {
    console.log("DB Init", JSON.stringify(operationResult));
    closeConnection();
}).catch((err) => {
    console.log("ERROR", err);
    closeConnection();
});

function closeConnection() {
    if (client) {
        client.end();
    }
}