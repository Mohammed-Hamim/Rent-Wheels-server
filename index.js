const express = require('express')
const cors = require('cors');
const app = express()
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000




// middleware
app.use(cors())

app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojsbdfn.mongodb.net/?appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Rent wheels server running ')
})



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const db = client.db("rentWheels")
        const carCollection = db.collection("all_cars")
        const sliderCollection = db.collection("slide_data")
        const topRatedCarsCollection = db.collection("top_rated_cars")

        /***********  Get from   database related api here **********/

        // get all cars apis
        app.get('/all_cars', async (req, res) => {
            console.log(req.query.email)
            const email = req.query.email
            // console.log(query)
            const query = {}
            if (email) {
                query.provider_email = email
            }
            const cursor = carCollection.find(query)

            const result = await cursor.toArray()
            res.send(result)
        })

        
        // get car by id
        app.get('/all_cars/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id)
            const query = { _id: new ObjectId(id) }
            // console.log(query)

            const result = await carCollection.findOne(query)
            // console.log(result)
            res.send(result)
        })


        // newest car apis
        app.get('/newest-cars', async (req, res) => {
            const cursor = carCollection.find().sort({ created_date: -1 }).limit(6)
            const result = await cursor.toArray()
            res.send(result)
        })

        // top rated car api
        app.get('/top_rated_cars', async (req, res) => {
            const cursor = topRatedCarsCollection.find()
            console.log(cursor)
            const result = await cursor.toArray()
            res.send(result)
        })

        /*********** update  database related api here **********/
        // update car data when booked  
        app.patch('/all_cars/:id', async (req, res) => {
            const id = req.params.id
            const updateCarData = req.body
            console.log(updateCarData)
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    status: updateCarData.status,

                }
            }

            const result = await carCollection.updateOne(query, update)
            res.send(result)
        })




        /***********  add to  database related api here **********/
        // add car api
        app.post("/all_cars", async (req, res) => {
            const newCar = req.body
            const result = await carCollection.insertOne(newCar)
            res.send(result)
        })


        // slide data api
        app.get('/slide_data', async (req, res) => {

            console.log(req.params)
            const cursor = sliderCollection.find()
            console.log(cursor)
            const result = await cursor.toArray()
            res.send(result)
        })












        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);








app.listen(port, () => {
    console.log(`Rent wheels listening on port ${port}`)
})