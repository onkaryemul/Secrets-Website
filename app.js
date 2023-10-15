
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Connet to new database called userDB
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.4158yrd.mongodb.net/userDB`, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => { console.log("Connected") })
.catch((err) => { console.log(err)});

// mongoose.set("useCreateIndex", true);


// Now our userSchema is not just simle javascript object, but is an object of mongoose.Schema class
const userSchema = new mongoose.Schema({
    // email & password are required for local authentication
    email: String, 
    password: String,
    googleId: String,  // for authentication with google --> we only get what equivalent to username on Google User database
    secret: String
});


// console.log(process.env.SECRET);

// userSchema.plugin(encrypt, { 
//     secret: process.env.SECRET, 
//     encryptedFields: ["password"] 
// });

// console.log(md5("123456"));


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());


/* Following commented code comes from passport-local-mongoose package ---> Work for only local strategy */
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


/* Following serializeUser & deserializeUser function comes from passport package ---> Work for any strategy */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id).then(function(user) {
        done(null, user);
    }).catch(function(err) {
        done(err, null);
    });
});



passport.use(new GoogleStrategy(
    {  // options
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    // callback function
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile);
        User.findOrCreate( {googleId: profile.id}, function (err, user) {
            return cb(err, user);
        });
    }
));


// GET request to "/" route
app.get("/", function (req, res) {
    res.render("home");
});


// GET request to "/auth/google" route
app.get("/auth/google",
   passport.authenticate("google", { scope: ["profile"] } )
);


// GET request to "/auth/google/secrets" route  ---> This GET request made by Google when they try to redirect the user back to our website
app.get("/auth/google/secrets", 
   passport.authenticate("google", { failureRedirect: "/login" }),
   function(req, res) {
       // successful authentication, redirect to "/secrets" route
       res.redirect("/secrets");
   }
);


// GET request to "/login" route
app.get("/login", function (req, res) {
    res.render("login");
});


// GET request to "/register" route
app.get("/register", function (req, res) {
    res.render("register");
});


// GET request to "/secrets" route
app.get("/secrets", function (req, res) {

    // if (req.isAuthenticated()) {
    //     res.render("secrets");
    // } else {
    //     res.redirect("/login");
    // }

    User.find({"secret": {$ne: null}})
        .then(function(foundUsers) {
           res.render("secrets", {usersWithSecrets: foundUsers});
        })
        .catch(function(err) {
           console.log(err);
        });

});


// GET request to "/submit" route
app.get("/submit", function(req, res) {
    
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }

});


// GET request to "/logout" route
app.get("/logout", function (req, res) {
    req.logout(function(err) {
        res.redirect("/");
    });
});


// POST request to "/register" route
app.post("/register", function (req, res) {

    /* 
       bcrypt.hash(req.body.password, saltRounds)
            .then((hash) => {
                const newUser = new User({
                                email: req.body.username,
                             // password: md5(req.body.password)  // hash function to turn registered password into an irreversible hash 
                                password: hash
                            });

                return newUser.save();
            })
           .then(() => {
                res.render("secrets");
            })
            .catch((err) => {
                console.log(err);
            });
    */

    User.register({ username: req.body.username }, req.body.password)
        .then(user => {
            // Registration successful
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        })
        .catch(err => {
            // Handle registration error
            if (err.name === 'UserExistsError') {
               // Redirect or display an error message for duplicate username
               console.log("Username already exists!");
               res.redirect("/register");
            } else {
               // Handle other registration errors
              console.log(err);
              res.redirect("/register");
        }
   });

});


// POST request to "/login" route
app.post("/login", function (req, res) {

    /*  
       const username = req.body.username;
    // const password = md5(req.body.password);  // hash function to turn login password into an irreversible hash 
       const password = req.body.password;

       User.findOne({ email: username })
           .then(foundUser => {
                if (foundUser) {
                   // if(foundUser.password === password) {
                   //     res.render("secrets");
                   // }
                   return bcrypt.compare(password, foundUser.password);
                } else {
                   throw new Error("User not found");
                }
           })
           .then(result => {
                if (result === true) {
                   res.render("secrets");
                } else {
                  throw new Error("Password does not match");
                }
            })
           .catch(err => {
                console.log(err);
            });
    */

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {

            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });

        }
    });

});


// POST request to "/submit" route
app.post("/submit", function(req, res) {

    const submittedSecret = req.body.secret;
    // console.log(req.user);
    // console.log(req.user.id);

    User.findById(req.user.id)
       .then((foundUser) => {
          if (foundUser) {
            foundUser.secret = submittedSecret;

            foundUser.save()
               .then(function() {
                   res.redirect("/secrets");
                })
               .catch(function(err) {
                   console.log(err);
                });  
          }
       })
       .catch(function(err) {
        console.log(err);
       });

});


app.listen(3000, function () {
    console.log("Server started on port 3000");
});




// Level 1 : Register Users with Username and Password

// Level 2 : Database  Encryption

// Level 3 : Hashing Passwords

// Level 4 : Salting and Hashing Passwords with bcrypt

// Level 5 : Cooking & Sessions ---> Using Passportjs to Add Cookies and Sessions

// Level 6 : OAuth 20 & How to Implement Sign In with Google

/*
  // Third Party OAuth 20 --> OAuth - Open Authorisation

   Why OAuth?

   1. Granular Access Levels
   2. Read/Read+Write access
   3. Revoke access

   Step 1: Set Up Your App
   Step 2: Redirect to Authenticate
   Step 3: User Logs in (on third party)
   Step 4: User Grants Permissions
   Step 5: Receive Authorisation code
   Step 6: Exchange AuthCode for Access Token
   
   TODO ---> Login with Google using passport & Google OAuth

   Challenge ---> Try to login with Facebook using passport & Facebook OAuth

*/


// Level 7: Finishing Up the App Letting Users Submit Secrets

