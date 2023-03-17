const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3017;

app.use(cookieParser())
app.use(express.json());

app.listen(PORT, () => {
    console.log(` http://localhost:${PORT} `);
})