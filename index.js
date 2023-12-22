const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000

//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fd2onld.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const taskCollection = client.db('taskMaster').collection('tasks');

        app.post('/tasks', async (req, res) => {
            const newTask = req.body;
            console.log(newTask);
            const result = await taskCollection.insertOne(newTask);
            res.send(result);
        })

        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })

        app.patch('/tasks/ongoing/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    category: 'OnGoing'
                }
            }
            const result = await taskCollection.updateOne(filter, updatedDoc);
            res.send(result);

        })
        app.patch('/tasks/completed/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    category: 'Completed'
                }
            }
            const result = await taskCollection.updateOne(filter, updatedDoc);
            res.send(result);

        })

        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const data = req.body;
            const updatedTest = {
                $set: {
                    name: data.name,
                    priority: data.priority,
                    date: data.date,
                    category: data.category,
                    description: data.description,
                    email: data.email

                }
            }
            const result = await taskCollection.updateOne(filter, updatedTest, options);
            res.send(result);
        })

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server running');
})
app.listen(port, () => {
    console.log(`sever running on ${port}`);
})