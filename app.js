require("dotenv").config();

const express = require ('express');
const path = require ('path');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const blog = require ("./models/blog");

//routes import
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

//middleware import
const {checkForAunthenticationCookie,
    createTokenForUser,
} = require ("./middlewares/authentication")

//app - instance
const app = express();
const PORT = process.env.PORT || 8000; 

//connected mongodb
mongoose.connect(process.env.MONGO_URL)
.then((e)=>console.log("Mongodb connected!")); 

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAunthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

//setting view engine - ejs
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//routes 
app.get("/", async(req,res) => {
    const allBlogs = await blog.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

//server live
app.listen (PORT, ()=>{
    console.log(`Server Started at PORT: ${PORT}`)
});