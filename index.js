
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qq0tl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected');
        const database = client.db("ac-shop-bd");
        const usersCollection = database.collection("users");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection("reviews");
        // create a document to insert

        //get all products
        app.get('/allProducts', async (req, res) => {
            const cursor = await productsCollection.find({}).toArray();
            res.json(cursor)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            let isAdmin = false
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //get users order
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await ordersCollection.find(query).toArray();
            res.json(result);
        })
        app.get('/allOrders', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.json(result);
        })

        app.get('/placeOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        //add product by admin
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })

        //order placed by user
        app.post('/placeOrder', async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.json(result);
        })

        //users review 

        app.post('/reviews', async (req, res) => {
            const result = await reviewsCollection.insertOne(req.body);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: { role: 'admin' }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            // console.log(result);
            res.json(result);
        })

        app.delete('/orders/:id', async (req, res) => {
            const query = req.params.id;
            const result = await ordersCollection.deleteOne({ _id: ObjectId(query) });
            console.log(result);
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('server is running');
})

app.listen(port, () => {
    console.log('listening to port', port);
})