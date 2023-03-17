const express = require("express");
const cookieParser = require("cookie-parser");
const usersRouter = require("./routes/user.route");
const app = express();
const PORT = 3017;
app.use(express.json()); 
app.use(cookieParser());

app.use('/',[usersRouter]);

app.listen(PORT, () => {
    console.log(` http://localhost:${PORT} `);
})

