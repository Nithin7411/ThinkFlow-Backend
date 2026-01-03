require("dotenv").config();
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');
const app = require('./src/app');
const PORT = process.env.PORT || 8000;
app.listen(PORT);
