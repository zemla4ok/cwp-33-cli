'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const Sequelize = require('sequelize');

const app = express();
const db = require('./db')(Sequelize);
const api = require('./controllers/api');
const tempDataToDb = require('./tempDataToDb.helper');

const PORT = config.app.port;
(async () => {
	await db.sequelize.sync({force: true});
	await tempDataToDb(db);

	app.use(bodyParser.json());

	app.use('/api', api(db));

	app.use((err, req, res, next) => res.status(err.status || 500).json(err.message));

	app.listen(PORT, () => {
		console.log(`server listen port ${PORT}`);
	});
})();
