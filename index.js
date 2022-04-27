const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
const cors=require('cors');
require('dotenv').config()

const ObjectId=require('mongodb').ObjectId
const fileUpload=require('express-fileupload')


const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json())
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pptx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
      await client.connect();
      const database = client.db("productsDb");
      const productCollection = database.collection("products");
      const orderCollection = database.collection("orders");
      const userCollection = database.collection("users");



      //  get price using _id

      app.get('/orders/:id',async(req,res)=>{
        const id= req.params.id
        const query= { _id: ObjectId(id)}
        const result=await orderCollection .findOne(query)
        res.json(result)
      })

      //  order get 
      // http://localhost:5000/orders?email=riya@gmail.com
      app.get('/orders', async(req,res)=>{
        const email=req.query.email
        const query={email:email}
        const cursor=orderCollection.find(query)
        const order=await cursor.toArray()
        res.json(order)
      })


      // add product to database

      app.post('/products', async(req,res)=>{
        // console.log('body', req.body);
        // console.log('files', req.files);

        const productName=req.body.productName
        const productDescrip=req.body.productDescrip
        const productPrice=req.body.productPrice
        
        const pic=req.files.image
        const picData=pic.data
        const encodePic=picData.toString('base64')

        const imageBuffer=Buffer.from(encodePic, 'base64')

        const product={
          productName,
          productDescrip,
          productPrice,
          image:imageBuffer
        }

        const result=await productCollection.insertOne(product)

        res.json(result)
      })


      // get product from database

      app.get('/products', async(req,res)=>{

        const cursor= productCollection.find({})
        const product=await cursor.toArray()
        res.json(product)
      })


      //  Admin or normal user findout

      // http://localhost:5000/users/riya@gmail.com

      app.get('/users/:email', async(req,res)=>{
        const email=req.params.email
        const query={email:email}
        const user=await userCollection.findOne(query)
        let isAdmin=false
        if(user?.roll === 'admin'){
          isAdmin=true
        }

       res.json({admin:isAdmin})
      })



      // save user to database
      app.post('/users', async(req,res)=>{
        const user=req.body
        console.log(user);
        const result=await userCollection.insertOne(user)
        res.json(result)
      })

      // save user to databse with google signin
      app.put('/users', async(req,res)=>{
        const user=req.body
        // console.log(user);
        const filter={email:user.email}
        const options={upsert:true}
        const updateDoc={$set:user}
        const result= await userCollection.updateOne(filter,updateDoc,options)

        res.json(result)


      })

      

      // order post
      app.post('/orders', async(req,res)=>{
        const orders=req.body
        const result=await orderCollection.insertOne(orders)
        // console.log(result);
        res.json(result)

      })


      // make admin 
      app.put('/user/admin', async(req,res)=>{
        const user=req.body
        console.log(user);
        const filter={email:user.email} 
        const updateDoc={$set:{roll:'admin'}}
        const result=await userCollection.updateOne(filter,updateDoc)
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