const bodyParser = require("body-parser");
const express = require("express");
const User = require("../models/users");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const  fs=require('fs');
var cookies = require("cookie-parser");


require("dotenv/config");

const path = require("path");
const { userInfo } = require("os");
const { CommentsController } = require("moongose/controller");
const comments_model = require("moongose/models/comments_model");

//create and assign a token

const app = express();

app.use(cookies()); 
app.use(bodyParser.json());
const router = express.Router();


// router.get("/", async (req, res) => {
// 	try {
// 		const users = await User.find();
// 		res.json(users);
// 	} catch (err) {
// 		res.send(err);
// 	}
// });

//New registreation ;
router.post("/register", async (req, res) => {

	
	

	const form = formidable();
	form.parse(req, async (err, fields, files) => {
		if (err) {
			return res.status(500).send("Internal server error");
		}
		const idExist = await User.findOne({ User_Id:fields.id });
		if (idExist) return res.status(400).send("is already exist");


		const newuser = new User({
			User_Id: fields.id,
			Password: md5(fields.pass)
		});

		try {
			const newRegister = await newuser.save();
			res.json(newRegister);
		} catch (err) {
			console.log(err);
		}
		
	});
	
});

// router.get("/login", (req, res) => {
// 	res.render("login");
// });



//login
router.post("/login", async (req, res) => {
	const form = formidable();
	
		const idExist = await User.findOne({
			User_Id: req.body.id,
			Password: md5(req.body.pass),
		});
		try{
		
		if (!idExist){
			
			return res.status(400).send("not-loggedin");
		}else{
			
		const token = await jwt.sign({ id: User._id }, process.env.TOKEN_SECRET,{

			expiresIn:process.env.JWT_EXPIRE,

		});

		res.send({token});
		res.status(200);	
	}

		}catch (err){
				console.log(err);
		}
	

	
});

module.exports = router;
