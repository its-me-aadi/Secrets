//jshint esversion:6
const express =require("express");
const bodyPArser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const encryption=require("mongoose-encryption");


const app=express();
app.use(bodyPArser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set('view engine','ejs');

const DB='mongodb+srv://itsadityasharma7124:Jaishreeram123@cluster0.rgyn6el.mongodb.net/Secrets?retryWrites=true&w=majority'

mongoose.connect(DB);
const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

const secret="this is my secret";
userSchema.plugin(encryption, { secret: secret, encryptedFields: ['password']});




const userData=mongoose.model("userdata",userSchema);
const user1=new userData({ 
email:"raand@123gmail.com",
password:"mainbhadwahu"

});
// user1.save();
app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",function(req,res){
    const userName=req.body.username;
    const pass=req.body.password;
    userData.findOne({email:userName})
        .then((foundUser)=>{
            if(foundUser){
                console.log(foundUser);
                if(foundUser.password===pass){
                    console.log("user found");
                    res.render("secrets");
                }
                else{
                    console.log("password incorrect");
                }
            
        }
        else{
            console.log("user not registered with us");
        }

        })
        .catch((err) => {
            //When there are errors We handle them here
        console.log(err);
        res.status(400).send("Bad Request");
        });
            
});

app.get("/register",function(req,res){
    res.render("register");
});


app.post("/register",function(req,res){
    const userName=req.body.username;
    const pass=req.body.password;
    const newUser=new userData({
        email:userName,
        password:pass
    });
    newUser.save().then(res.render("secrets"));
    // userData.find({email:userName})
    // .then((foundUser)=>{
        
    //     if(foundUser){
    //         console.log(foundUser);
    //     }
    //     else{

    //     }
    // })
    
});

app.get("/secrets",function(req,res){
    res.render("secrets");
});


app.listen("3000",function(req,res){
    console.log("server started at 3000");
});

