const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const repository = require('../repository/invoices.repository');
const axios = require('axios');

router.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
        return;
    }
    const authorization = req.header('authorization');
    if (!authorization) {
        res.status(403);
        return res.json({
            message: 'Requires authentication'
        });
    }

    axios.get(`${process.env.SERVICE_USER}/auth/profile`, {
        headers: {
            'Authorization': authorization
        }
    }).then((resp) => {
        if (resp.data && resp.data.id) {
            res.locals.user = resp.data;
            next();
        }
    }).catch((err) => {
        console.log(err);
        res.status(403);
        res.json({
            message: 'User verification failed'
        });
    });
});

router.get('/', async (req, res) => {
    try {
        const invoices = await repository.fetchByUser(res.locals.user.id);
        res.json(invoices);
    } catch (err) {
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