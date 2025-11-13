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
        const topRatedCarsCollection = db.collection("top_rated_cars")
        const bookingCollection = db.collection("bookings")

        /***********  Get from   database related api here **********/

        // get all cars apis
        app.get('/all_cars', async (req, res) => {          
            const email = req.query.email       
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
            const query = { _id: new ObjectId(id) }
            const result = await carCollection.findOne(query)         
            res.send(result)
        })
     
        // top rated car api
        app.get('/top_rated_cars', async (req, res) => {
            const cursor = topRatedCarsCollection.find()         
            const result = await cursor.toArray()
            res.send(result)
        })


        // booking api
        app.get('/bookings', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.user_email = email
            }

            const cursor = bookingCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        /*********** update  database related api here **********/
        // update car data when booked  
        app.patch('/all_cars/:id', async (req, res) => {
            const id = req.params.id
            const updateCarData = req.body
           
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    status: updateCarData.status,

                }
            }

            const result = await carCollection.updateOne(query, update)
            res.send(result)
        })


        // api for updating car when a user update it 
        app.patch('/update_car/:id', async (req, res) => {
            const id = req.params.id
            const updatedCarData = req.body

            const query = { _id: new ObjectId(id) }

            const update = {
                $set: {
                    car_name: updatedCarData.car_name,
                    description: updatedCarData.description,
                    category: updatedCarData.category,
                    rent_price: updatedCarData.rent_price,
                    location: updatedCarData.location,
                    image_url: updatedCarData.image_url,
                    provider_name: updatedCarData.provider_name,
                    provider_email: updatedCarData.provider_email

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

        // add bookings 
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })


        /***********  remove from  database related api here **********/
        // delete car by id
        app.delete("/all_cars/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carCollection.deleteOne(query)
            res.send(result)
        })
        // delete booking api 
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
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