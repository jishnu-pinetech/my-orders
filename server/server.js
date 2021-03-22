const express = require("express");
const cors = require("cors");

require('dotenv').config();
const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require('./routes/index').default(app);

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});

module.exports = app;