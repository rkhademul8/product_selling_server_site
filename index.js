const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
const cors=require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pptx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
      await client.connect();
      const database = client.db("productsDb");
      const productCollection = database.collection("products");
      const orderCollection = database.collection("orders");


      // order post
      app.post('/orders', async(req,res)=>{

        const orders=req.body
        // console.log(orders);
        const result=await orderCollection.insertOne(orders)

        res.json(result)

      })


   
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})