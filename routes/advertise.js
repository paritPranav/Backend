const bodyParser = require("body-parser");
const express = require("express");
const Advertise=require('../models/advertisements');
const AdvertiseBills=require('../models/advertiseBills');

const jwt = require('jsonwebtoken');
const verify=require('./jwtverify');
const multer =require('multer');
const formidable = require("formidable");
const  fs=require('fs');
const util=require('util')
const unlinkFile=util.promisify(fs.unlink)
 
const path = require('path');
var cookies = require("cookie-parser");

const {uploadFile}=require("./s3");
const advertiseBills = require("../models/advertiseBills");


const app=express();
app.use(express.static("public"))


// app.use(express.static("public"))

    
app.use(bodyParser.json());

app.use(cookies());
// app.set('view engine', 'ejs');

const router = express.Router();
const upload=multer({dest:'uploads/'});


router.get("/",async(req,res)=>{
try{
    const alladvertisement=await Advertise.find();
    res.send(alladvertisement);

}catch(err){
    console.log(err);
}

})
router.get("/bills",async(req,res)=>{
  
    try{
        const allBills=await AdvertiseBills.find();
        res.send(allBills);
    }catch(err){
        console.log(err);
    }
})

router.post("/addBill",verify, async(req,res)=>{
    console.log(req.body);
    const newbill=new advertiseBills({
        Provider_Name:req.body.Pname,
        adAmount:req.body.amount,
        paymentStaus:req.body.status,
        adDuration:req.body.duration
    });
    try{
        
        await newbill.save();
        res.send("done")
        res.status(200);
    }catch(err){
        console.log(err);
    }

})

router.patch("/updatepaymentstatus",async(req,res)=>{
let id=req.body.id;
    try{
        const update=await advertiseBills.updateOne(
            {_id:id},
            {
                $set:{
                    paymentStaus:req.body.status
                }
            }
        )
        res.send("Done");
    }catch(err){
        console.log(err);
    }
})

router.post("/addadvertise",upload.single('image'),verify, async(req,res)=>{
    const file=req.file;
    const result=await uploadFile(file);
    await unlinkFile(file.path)

    const newAdvertise=new Advertise({

        Advertise_image:result.Location
    
    })
    try{
       let data= await newAdvertise.save();
        res.send(data);
        res.status(200);
    }catch(err){
       res.send(err);
    }

})


router.delete("/deleteAdvertise",verify,async(req,res)=>{
    try{
        const removeadvertise=await Advertise.deleteOne({_id:req.body.id});
        console.log(removeadvertise)
        if(removeadvertise.deletedCount){
            res.send("Deleted");
        }else{
            res.send("Not Deleted")
        }
    }catch(err){
        console.log(err);
    }

})
module.exports = router;
