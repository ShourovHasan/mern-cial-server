const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;
require('dotenv').config();


const app = express();

// Middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qwlqnnv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
    try {
        const usersCollection = client.db("merncial").collection("users");
        const postsCollection = client.db("merncial").collection("posts");
        const commentsCollection = client.db("merncial").collection("comments");
        const reactionsCollection = client.db("merncial").collection("reactions");
        const messagesCollection = client.db("merncial").collection("messages");
        
        // users
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = {
                email: user.email
            }
            const alreadyAddedUser = await usersCollection.find(query).toArray();
            if (alreadyAddedUser.length) {
                const message = `already you are our user. Don't need to create an account`;
                return res.send({ message })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const uUser = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    userAddress: uUser.userAddress,
                    institute: uUser.institute
                }
            }
            const result = await usersCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })
        // messages 
        app.post('/addMessage', async (req, res) => {
            const user = req.body;            
            const result = await messagesCollection.insertOne(user);
            res.send(result);
        })
        app.get('/addMessage/:email', async (req, res) => {
            const email = req.params.email;
            const query = {
                oppositeUserEmail: email,
            };
            const oppositeUser = await messagesCollection.find(query).toArray();
            const query2 = {
                myEmail: email,
            };
            const myUser = await messagesCollection.find(query2).toArray();
            res.send({ oppositeUser, myUser });
        });















        // posts 
        app.get('/posts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const postDetails = await postsCollection.find(query).toArray();
            res.send(postDetails);
        });
        app.get('/posts3', async (req, res) => {
            const query = {};
            const posts = await postsCollection.find(query).sort('like', -1).limit(3).toArray();
            // const posts = await postsCollection.find(query).limit(3).toArray();
            res.send(posts);
        });
        app.get('/posts', async (req, res) => {
            const query = {};
            const posts = await postsCollection.find(query).sort('_id', -1).toArray();
            res.send(posts);
        });
        app.post('/post', async (req, res) => {
            const post = req.body;
            const result = await postsCollection.insertOne(post);
            res.send(result);
        })
        app.put('/postsReaction/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const uUser = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    like: uUser.like
                }
            }
            const result = await postsCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })

        // reviews 
        app.post('/addReviews', async (req, res) => {
            const review = req.body;
            const result = await commentsCollection.insertOne(review);
            res.send(result);
        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { postId: id };
            const result = await commentsCollection.find(query).sort('_id', -1).toArray();
            res.send(result);
        });

        // reviewReaction
        app.get('/reviewReaction/:id', async (req, res) => {
            const id = req.params.id;
            const query = { postId: id };
            const result = await reactionsCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/reviewReaction', async (req, res) => {
            const reaction = req.body;
            const query = {
                reviewerEmail: reaction.reviewerEmail,
                postId: reaction.postId,
            }
            const alreadyAddedReaction = await reactionsCollection.find(query).toArray();
            if (alreadyAddedReaction.length) {
                const message = `already you react this post, you can't react more than one time`;
                return res.send({ message })
            }
            const result = await reactionsCollection.insertOne(reaction);
            res.send(result);
        })


    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', async (req, res) => {
    res.send('Merncial server is running');
})

app.listen(port, () => {
    console.log(`Merncial is running on port ${port}`)
})


