require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const chalk = require("chalk");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const User = require("./models/User");


/**
 * Controllers (route handlers).
 */
const departmentController = require("./controllers/Department");
const employeeController = require("./controllers/Employee");
const counselingController = require("./controllers/Counseling");
const performanceController = require("./controllers/Performance");
const userController = require("./controllers/User");

const app = express();
app.set("view engine", "ejs");


/**
 * notice above we are using dotenv. We can now pull the values from our environment
 */
const { WEB_PORT, MONGODB_URI } = process.env;


/**
 * connect to database
 */
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on("error", (err) => {
    console.error(err);
    console.log(
        "MongoDB connection error. Please make sure MongoDB is running.",
        chalk.red("✗")
    );
    process.exit();
});


/***
 * We are applying our middleware
 */
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressSession({ secret: 'foo barr', saveUninitialized: true, resave: false, cookie: {} }))


app.use("*", async (req, res, next) => {
    global.user = false;
    if (req.session.userID && !global.user) {
        const user = await User.findById(req.session.userID);
        global.user = user;
    }
    next();
})

const authMiddleware = async (req, res, next) => {
    const user = await User.findById(req.session.userID);
    if (!user) {
        return res.redirect('/');
    }
    next()
}

app.get("/", userController.displayLogin);

app.get("/departments", departmentController.list);
app.get("/create-department", departmentController.createView);
app.post("/create-department", departmentController.create);
app.get("/departments/delete/:id", departmentController.delete);
app.get("/departments/update/:id", departmentController.edit);
app.post("/departments/update/:id", departmentController.update);

app.get("/employees", employeeController.list);
app.get("/create-employee", employeeController.createView);
app.post("/create-employee", employeeController.create);
app.get("/employees/delete/:id", employeeController.delete);
app.get("/employees/update/:id", employeeController.edit);
app.post("/employees/update/:id", employeeController.update);

app.get("/counselings", counselingController.list);
app.get("/create-counseling", counselingController.createView);
app.post("/create-counseling", counselingController.create);
app.get("/counselings/delete/:id", counselingController.delete);
app.get("/counselings/update/:id", counselingController.edit);
app.post("/counselings/update/:id", counselingController.update);

app.get("/performances", performanceController.list);
app.get("/create-performance", performanceController.createView);
app.post("/create-performance", performanceController.create);
app.get("/performances/delete/:id", performanceController.delete);
app.get("/performances/update/:id", performanceController.edit);
app.post("/performances/update/:id", performanceController.update);

app.get("/register", userController.displayCreate);
app.post("/register", userController.create);
app.get("/login", userController.displayLogin);
app.post("/login", userController.login);

app.listen(WEB_PORT, () => {
    console.log(
        `Example app listening at http://localhost:${WEB_PORT}`,
        chalk.green("✓")
    );
});
