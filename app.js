const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv/config");
var cookies = require("cookie-parser");
const cors= require('cors');
const {sitemapupdate}=require("./routes/sitemap_update")

const app = express(); 
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use(cookies());

app.use(cors());

mongoose.connect(
	process.env.DB_Connect,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	() => {}
);


//import routes
const PostRoute = require("./routes/posts");
const UserRoute = require("./routes/user");	
const AdvertiseRoute=require("./routes/advertise");

//middleware
app.use("/posts", PostRoute);
app.use("/user", UserRoute);
app.use("/advertise",AdvertiseRoute);
app.set('view engine', 'ejs');
app.use(express.static("public"))


//Home get request
app.get('/',async(req,res)=>{
    res.send("Home")
})

app.get('/sitemap',(req,res)=>{
	

res.sendFile(__dirname+"/sitemap.xml")
})
app.listen(3000, () => {
	
});

