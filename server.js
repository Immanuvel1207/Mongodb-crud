const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// MongoDB connection details
const uri = 'mongodb://localhost:27017';
const dbName = 'mydatabase';
const collectionName = 'users';

// Middleware to parse JSON bodies
app.use(express.json());

// Handle POST requests to insert data
app.post('/insert', async (req, res) => {
    const { name, age } = req.body;

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Check if user already exists
        const existingUser = await collection.findOne({ name });
        if (existingUser) {
            console.log('User already exists:', existingUser);
            res.status(409).send('User already exists');
        } else {
            // Insert data into MongoDB
            await collection.insertOne({ name, age });
            res.sendStatus(200); // Send success status
        }
    } catch (error) {
        console.error('Error inserting data:', error);
        res.sendStatus(500); // Send error status
    } finally {
        await client.close();
    }
});

// Handle GET requests to read data by user name
app.get('/getByName/:name', async (req, res) => {
    const name = req.params.name;

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Find data by user name
        const result = await collection.findOne({ name });

        if (result) {
            res.json(result); // Send JSON response
        } else {
            res.sendStatus(404); // Send not found status
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.sendStatus(500); // Send error status
    } finally {
        await client.close();
    }
});

// Handle PUT requests to update data
app.put('/update/:name', async (req, res) => {
    const name = req.params.name;
    const { age } = req.body;

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Update data in MongoDB
        const result = await collection.updateOne(
            { name },
            { $set: { age } }
        );

        if (result.modifiedCount > 0) {
            res.sendStatus(200); // Send success status
        } else {
            res.sendStatus(404); // Send not found status if document not modified
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.sendStatus(500); // Send error status
    } finally {
        await client.close();
    }
});

// Handle DELETE requests to delete data
app.delete('/delete/:name', async (req, res) => {
    const name = req.params.name;

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Delete data from MongoDB
        const result = await collection.deleteOne({ name });

        if (result.deletedCount > 0) {
            res.sendStatus(200); // Send success status
        } else {
            res.sendStatus(404); // Send not found status if document not deleted
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.sendStatus(500); // Send error status
    } finally {
        await client.close();
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
