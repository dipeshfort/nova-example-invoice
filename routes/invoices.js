const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const repository = require('../repository/invoices.repository');

router.get('/', async (req, res) => {
    try {
        const invoices = await repository.fetchAll();
        res.json(invoices);
    } catch (err) {
        error500(err, res);
    }
});

router.post('/', async (req, res) => {
    const invoiceData = {
        userId: req.body.userId,
        title: req.body.title,
        comments: req.body.comments,
        amount: +req.body.amount,
        remindDate: req.body.remindDate,
        status: req.body.status
    }

    try {
        const invoiceId = await repository.create(invoiceData);
        const invoice = await repository.fetchOne(invoiceId);
        res.status(201);
        res.json(invoice);
    } catch(err) {
        error500(err, res);
    }
});

router.delete('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    try {
        const affectedRows = await repository.delete(invoiceId);
        res.status((affectedRows === 0)? 404: 204);
        res.json({});
    } catch(err) {
        error500(err, res);
    }
});

router.patch('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    const data = req.body;

    try {
        const affectedRows = await repository.update(invoiceId, data);
        if (affectedRows === 0) {
            res.status(404);
            res.json({});
        }
        
        const invoice = await repository.fetchOne(invoiceId);
        res.status(200);
        res.json(invoice);
    } catch(err) {
        error500(err, res);
    }
});

function error500(err, res) {
    logger.error(JSON.stringify(err));
    res.status(500);
    res.json({
        code: err.code,
        message: err.message
    });
}

module.exports = router;