const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');



// Middle Ware 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.guif9pr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Token verify function
// function verifyJWT(req, res, next) {
//    const authHeader = req.headers.authorization;
//    if (!authHeader) {
//       return res.status(401).send('Unauthorized Access');
//    }

//    const token = authHeader.split(' ')[1];
//    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//       if (err) {
//          return res.status(403).send({ message: 'Forbidden Access' });
//       }
//       req.decoded = decoded;
//       next();
//    })
// }



async function run() {
   try {
      const postCollection = client.db('Meta').collection('allPost');
      const usersCollection = client.db('Meta').collection('allUsers');


      // Get Token
      // app.get('/jwt', async (req, res) => {
      //    const email = req.query.email;
      //    const query = { email: email };
      //    const user = await usersCollection.findOne(query);
      //    if (user) {
      //       const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
      //       return res.send({ accessToken: token });
      //    }
      //    res.status(403).send({ accessToken: '' });
      // });


      // create User 
      app.post('/users', async (req, res) => {
         const user = req.body;
         const email = user.email;
         const query = { email: email };
         const find = await usersCollection.findOne(query);

         if (find) {
            return res.send({ message: 'user already register.' });
         };

         const result = await usersCollection.insertOne(user);
         res.send(result);
      })

      // Create Post 
      app.post('/posts', async (req, res) => {
         const post = req.body;
         const result = await postCollection.insertOne(post);
         res.send(result);
      })


      // Get posts
      app.get('/posts', async (req, res) => {
         const query = {};
         const option = {
            sort: { date: -1 }
         }
         const posts = await postCollection.find(query, option).toArray();
         res.send(posts)
      })


      // Get post By id
      app.get('/posts/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await postCollection.findOne(query);
         res.send(result);
      })

      // Get User  By Email
      app.get('/users', async (req, res) => {
         const email = req.query.email;
         const query = { email: email }
         const result = await usersCollection.findOne(query);
         res.send(result);
      })

      // Update User 
      app.put('/users/:id', async (req, res) => {
         const id = req.params;
         const filter = { _id: ObjectId(id) };
         const body = req.body.userObj;
         const options = { upsert: true };
         const updateDoc = {
            $set: {
               body
            },
         };
         const result = await postCollection.updateOne(filter, updateDoc, options);
         res.send(result);
      })

      // Get Top Posts 
      app.get('/topPosts', async (req, res) => {
         const query = {};
         const option = {
            sort: { reaction: -1 }
         }
         const posts = await postCollection.find(query, option).limit(3).toArray();
         res.send(posts)
      })

      /*  <-------------------------------------- Like & Comment ----------------------------------------------> */

      app.put('/postLike/:id', async (req, res) => {
         const id = req.params;
         const query = { _id: ObjectId(id) }
         const like = req.body.react;
         const options = { upsert: true };
         const updateDoc = {
            $set: {
               reaction: like
            },
         };
         const result = await postCollection.updateOne(query, updateDoc, options);
         res.send(result);
      })


      app.put('/postComments/:id', async (req, res) => {
         const id = req.params;
         const filter = { _id: ObjectId(id) };
         const comment = req.body;
         const options = { upsert: true };
         const updateDoc = {
            $set: {
               comments: comment
            },
         };
         const result = await postCollection.updateOne(filter, updateDoc, options);
         res.send(result);
      })

   }
   finally {
   }


}
run().catch(er => console.log(er));





app.get('/', (req, res) => {
   res.send('Meta server is running.')
})

app.listen(port, () => {
   console.log(port, 'is running.');
})