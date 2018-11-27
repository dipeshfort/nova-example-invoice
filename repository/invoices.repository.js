const db = require('../utils/db');
const logger = require('../utils/logger');
const {
    v4
} = require('uuid');

class InvoicesRepository {
    constructor(context) {
        this.table = 'invoices';
        this.context = context;
    }

    async fetchAll() {
        const result = await this.context.query(`SELECT * from ${this.table}`);
        logger.trace(`Returned ${result.rows.length} invoices.`);
        return result.rows.map((rowItem) => {
            return this.toInvoice(rowItem)
        });
    }

    async fetchByUser(userId) {
        const query = {
            name: 'fetch-invoice-by-user_id',
            text: `SELECT * FROM ${this.table} WHERE user_id = $1`,
            values: [userId]
        };
        const result = await this.executeQuery(query);
        logger.trace(`Returned ${result.rows.length} invoices.`);
        return result.rows.map((rowItem) => {
            return this.toInvoice(rowItem)
        });
    }

    async fetchOne(invoiceId) {
        const query = {
            name: 'fetch-invoice-by-id',
            text: `SELECT * FROM ${this.table} WHERE id = $1`,
            values: [invoiceId]
        };

        const result = await this.executeQuery(query);
        if (!result.rows.length) {
            return null;
        }
        return this.toInvoice(result.rows[0])
    }

    async create(invoiceData) {
        const invoiceId = v4();
        const { userId, title, comments, amount, remindDate, status } = invoiceData;
        const query = {
            name: 'insert-invoice',
            text: `INSERT INTO ${this.table}(id, user_id, title, comments, amount, remind_date, status) VALUES($1, $2, $3, $4, $5, $6, $7)`,
            values: [invoiceId, userId, title, comments, amount, remindDate, status]
        };
        const result = await this.executeQuery(query)
        if (result.rowCount !== 1) {
            throw new Error("ERROR_DB_FAIL::Unable to create resource");
        }
        return invoiceId;
    }

    /**
     * Delete by Id
     * @param {number} affectedRows
     */
    async delete(invoiceId) {
        const query = {
            name: 'delete-invoice',
            text: `DELETE from ${this.table} WHERE id = $1`,
            values: [invoiceId]
        };
        const operationResult = await this.executeQuery(query);
        return operationResult.rowCount;
    }

    /**
     * Update with new data
     * @param {number} affectedRows
     */
    async update(invoiceId, data) {
        const values = [];

        const updates = Object.keys(data).map((field, idx) => {
            // Intentional extra $ near '${idx...'
            let dbField;
            switch(field) {
                case 'title': 
                    dbField = 'title';
                    break;
                case 'comments': 
                    dbField = 'comments';
                    break;
                case 'amount':
                    dbField = 'amount';
                    break;
                case 'remindDate':
                    dbField = 'remind_date';
                    break;
                case 'status': 
                    dbField = 'status';
                    break;
                default:
                    throw new Error('Invalid update field' + field);
            }
            values.push(data[field]);
            return `${dbField} = $${idx + 1}`;
        }).join(',');

        const query = {
            // Intentional extra '$' near 'id ='
            text: `UPDATE ${this.table} SET ${updates} WHERE id = $${values.length + 1}`,
            values: [...values, invoiceId]
        };
        const operationResult = await this.executeQuery(query);
        return operationResult.rowCount;
    }

    async executeQuery(query) {
        try {
            return await this.context.query(query)
        } catch (error) {
            let customError;

            if (!error.code) {
                throw error;
            }

            switch (error.code) {
                case 'ECONNREFUSED':
                    customError = new Error('Error connecting to database');
                    customError.code = 'ERR_DB_CONNECTION';
                    customError.details = '';
                    customError.original = error;
                    throw customError;
                default:
                    throw error;
            }
        }
    }

    toInvoice(row) {
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            comments: row.comments,
            amount: row.amount,
            remindDate: row.remind_date,
            created: row.created,
            status: row.status
        };
    }
}
module.exports = new InvoicesRepository(db);