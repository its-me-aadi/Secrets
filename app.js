//jshint esversion:6
require('dotenv').config();
const express =require("express");
const bodyPArser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
// const md5=require("md5");
// const bcrypt=require("bcrypt");
// const saltRounds=8;
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app=express();
app.use(bodyPArser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set('view engine','ejs');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));
//passport and session initialise
app.use(passport.initialize());
app.use(passport.session());

//database connect
const pass=process.env.DB_PASS;
const DB='mongodb+srv://itsadityasharma7124:'+pass+'@cluster0.rgyn6el.mongodb.net/Secrets?retryWrites=true&w=majority';

mongoose.connect(DB).then(console.log("db connected"));
const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    googleId: String,
    secret: String
});

//plugin userschema with passport and findOrcreate
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//creating mongosse model using userschema
const userData=mongoose.model("userData",userSchema);

//serialise and deserialize user
passport.use(userData.createStrategy());
passport.serializeUser(function(userData,done){
    done(null,userData);
});
passport.deserializeUser(function(userData, done) {
    done(null, userData);
  });

//google oAuth
passport.use(new GoogleStrategy({
    clientID: process.env.Client_ID,
    clientSecret: process.env.Client_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    userData.findOrCreate({googleId:profile.id},function(err,user){
        return cb(err,user);
    });
  }
));



app.get("/",function(req,res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("/secrets");
  });

app.get("/login",function(req,res){
    res.render("login");
});


app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.post("/register",function(req,res){
    userData.register({username:req.body.username}, req.body.password, function(err, user) {    //register using passport and authenticating after register
        if (err) {
            console.log("error");
            res.redirect("/register"); 
        }
        else{
            passport.authenticate('local')(req,res,function(){
                res.redirect("/secrets");
            });
        }
      
      });
});

app.post("/login",function(req,res){
    const user=new userData({
        email:req.body.username,
        password:req.body.password
    });
    
    req.login(user,(err)=>{         //verifying and login the user usin passport and authenticating if successfully logegd in
        if(err){
            console.clear();
            console.log(err);
        }
        else{
            passport.authenticate('local')(req,res,function(){
                            res.redirect("/secrets");
                        });
        }
    });
            
});

app.listen("3000",function(req,res){
    console.log("server started at 3000");
});

