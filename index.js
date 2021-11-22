const express = require('express')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors')
const fileUpload = require('express-fileupload')

const app = express()
const port = process.env.PORT || 5000

//Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ack9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("pikaryBazar");
        const categoryCollection = database.collection("categories");
        const productCollection = database.collection("products");
        console.log('Database connection Successfully')

        //Recieve category from client side ->dashboard
        app.post('/categories', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64')
            const imageBuffer = Buffer.from(encodedImage, 'base64')
            const category = {
                name,
                email,
                image: imageBuffer
            }
            const result = await categoryCollection.insertOne(category);
            res.json(result)
        })
        app.get('/categories', async (req, res) => {
            const categories = categoryCollection.find({});
            const result = await categories.toArray()
            res.json(result)
        })
        //Delete Category from Database
        app.delete('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await categoryCollection.deleteOne(query)
            res.json(result)
        })
        //Recieve product from dashboard-> add product
        app.post('/products', async (req, res) => {
            const title = req.body.title;
            const description = req.body.description;
            const category = req.body.category;
            const stock = req.body.stock;
            const regularPrice = req.body.regularPrice;
            const offerPrice = req.body.offerPrice;

            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64')
            const imageBuffer = Buffer.from(encodedImage, 'base64')
            const product = {
                title,
                description,
                category,
                stock,
                regularPrice,
                offerPrice,
                image: imageBuffer
            }
            const result = await productCollection.insertOne(product);
            res.json(result)
        })
        //Display products 
        app.get('/products', async (req, res) => {
            const products = productCollection.find({})
            const result = await products.toArray()
            res.json(result);
        })
        //Delete Products from Database
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Pikary bazar server running')
})

app.listen(port, () => {
    console.log("Running Port: ", port)
})