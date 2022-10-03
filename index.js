const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const URL = "mongodb+srv://admin:admin123@cluster0.hijj3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const secret = "jGa3BhjuS2Msg"
app.use(express.json());
app.use(cors({
    origin: "*",
}))

let authenticate = function (req, res, next) {
    if (req.headers.authorization) {
        try {
            let result = jwt.verify(req.headers.authorization, secret);
            next();
        } catch (error) {
            res.status(401).json({ message: "Token Invalid" })
        }
    } else {
        res.status(401).json({ message: "Not Authorized" })
    }
}

//user registeration
app.post("/register", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("Capstone");

        //Password encrypt
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        await db.collection("userDetails").insertOne(req.body)
        await connection.close();
        res.json({ message: "user created!!" })
    } catch (error) {
        console.log(error)
    }
})

//user login

app.post("/login", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("Capstone");
        let user = await db.collection("userDetails").findOne({ email: req.body.email })
        if (user) {
            let passwordResult = await bcrypt.compare(req.body.password, user.password)
            if (passwordResult) {
                let token = jwt.sign({ userid: user._id }, secret, { expiresIn: "1h" });
                res.json({ token })
            } else {
                res.status(401).json({ message: "Email Id or Password did not match" })
            }
        } else {
            res.status(401).json({ message: "Email Id or Password did not match" })
        }
    } catch (error) {
        console.log(error)
    }
})

//userdashboard
app.get("/userdashboard", authenticate, function (req, res) {
    res.json({ authorization: "successful" })
})

//get all event
app.get("/event", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL)

        let db = connection.db("Capstone")
        let users = await db.collection("events").find({}).toArray()
        await connection.close();
        res.json(users)
    } catch (error) {
        console.log(error)
    }

})

//get a edit event
app.get("/event/:id", async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("Capstone");
        let objId = mongodb.ObjectId(req.params.id)
        let user = await db.collection("events").findOne({ _id: objId })
        await connection.close()
        if (user) {
            res.json(user)
        } else {
            res.status(401).json({ message: "User Not Found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

// create a event
app.post("/add", async (req, res) => {

    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("Capstone")
        await db.collection("events").insertOne(req.body)
        await connection.close();
        res.json({ message: "user added" })
    } catch (error) {
        console.log(error)
    }
})

//update event

app.put("/event/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("Capstone");
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("events").updateOne({ _id: objId }, { $set: req.body })
        await connection.close()
        res.json({ message: "user updated" })
    } catch (error) {
        console.log(error)
    }
})

//delete event
app.delete("/event/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("Capstone");
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("events").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "User Deleted" })
    } catch (error) {
        console.log(error)
    }
});


//apply Form

//Apply register form get
app.get("/userdata", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL)

        let db = connection.db("Capstone")
        let users = await db.collection("userdata").find({}).toArray()
        await connection.close();
        res.json(users)
    } catch (error) {
        console.log(error)
    }

})

// Apply register form
app.post("/details", async (req, res) => {

    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("Capstone")
        await db.collection("userdata").insertOne(req.body)
        await connection.close();
        res.json({ message: "user added" })
    } catch (error) { 
        console.log(error)
    }
})


app.listen(process.env.PORT || 3000)