const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); // Mongo
const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nah5m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader){
    return res.status(401).send({message: 'Unauthorized access'})
  }
  next();
}

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("ai_roller").collection("products");
    const reviewCollection = client.db("ai_roller").collection("reviews");
    const orderCollection = client.db("ai_roller").collection("orders");
    const usersCollection = client.db("ai_roller").collection("users");

    // get data from db to a server as api
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });


    app.post("/allorders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });

    app.get("/allorders",verifyJwt, async (req, res) => {
      const user = req.query.userEmail;
      const query = {user:user}
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });


    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });



    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });


    // get single data by id from db to a server as api
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });


    app.put('/user/:email', async (req, res)=>{
      const email = req.params.email;
      const user = req.body;
      const filter = {email:email};
      const options = {upsert: true};
      const updateDoc ={
        $set: user,
      }
      const result = await usersCollection.updateOne(filter,updateDoc, options);
      const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' })
      res.send({result, token});
    })



  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
