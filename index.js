const { MongoClient, ServerApiVersion } = require('mongodb'); // Mongo
const express = require('express')
const app = express()
require('dotenv').config();
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


// Mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nah5m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection = client.db('ai_roller').collection('products');

        // get data from db to a server url as api
        app.get('/product' , async(req, res)=>{
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })
    }
    finally{

    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})