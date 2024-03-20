const {MongoClient, ObjectId} = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const express = require('express');
const  {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');

const app = express();

//Define the Graphql Schema

const schema = buildSchema(`
 
    type Book {
      _id: ID,
      name: String,
      price: Int,
      authorName: String,
    }
    type Student {
      _id: ID,
      name: String,
      age: Int,
      city: String,
      pincode: Int
    }
  

    type Query {
      getBook(id:ID!):Book
      getBooks: [Book]

      getStudent(id:ID!):Student
      getStudents: [Student]
    }
    type Mutation {
     createBook(name:String, price: Int, authorName: String): Book
     updateBook(_id:ID, name:String, price: Int, authorName: String): Book
     deleteBook(id:ID): Book

     createStudent(name:String, age: Int, city: String, pincode: Int): Student
     updateStudent(_id:ID, name:String, age: Int, city: String, pincode: Int): Student
     deleteStudent(id:ID): Student
    }

   
   
   
`)


const startServer = async ()=>{
    const connectionUrl = process.env.MONGODB_URL;
    const port = process.env.PORT;
    try{
       const client = new MongoClient(connectionUrl);
       await client.connect();
       //console.log('database successfully connected');

       //create mongodb collection
       const db = client.db('study');
       const collection = db.collection('book');
       
       const studentCollection = db.collection('student');
       //create resolvers
       const root = {
        getBook: async ({id})=>{
          const book = await collection.findOne({_id: new ObjectId(id)});
          return book;
        },
        getBooks: async ()=>{
          const books = await collection.find().toArray();
          return books;
        },
        createBook: async ({name, price, authorName})=>{
            const result = await collection.insertOne({name, price, authorName});
            return {_id: result.insertedId, name, price, authorName}
        },
        updateBook: async({id,name,price,authorName})=>{
            await collection.updateOne({_id:new ObjectId(id)}, {$set:{name,price,authorName}});
            return ({_id:id,name,price,authorName})
        },
        deleteBook : async ({id})=>{
            const deleteBook= await collection.findOne({_id: new ObjectId(id)});
           await collection.deleteOne({_id:new ObjectId(id)});
            return deleteBook;
        },

         //create resolvers
    
        getStudent: async ({id})=>{
          const student = await studentCollection.findOne({_id: new ObjectId(id)});
          return student;
        },
        getStudents: async ()=>{
          const students = await studentCollection.find().toArray();
          return students;
        },
        createStudent: async ({name, age, city,pincode})=>{
            const result = await studentCollection.insertOne({name, Student, city,pincode});
            return {_id: result.insertedId, name, age, city, pincode}
        },
        updateStudent: async({id,name,price,authorName})=>{
            await studentCollection.updateOne({_id:new ObjectId(id)}, {$set:{name,price,authorName}});
            return ({_id:id,name, age, city, pincode})
        },
        deleteBook : async ({id})=>{
            const deleteStudent= await studentCollection.findOne({_id: new ObjectId(id)});
           await studentCollection.deleteOne({_id:new ObjectId(id)});
            return deleteStudent;
        }
       
       }
         //middleware use 
         app.use(cors());
         app.use(express.json());
         app.use(bodyParser.urlencoded({extended:true}));

       //GraphQl Endpoints

       app.use("/graphql", graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
       }))

       app.listen(port,()=>{
        console.log(`Listening port is http://localhost:${3000}`);
       })
    }catch(error){
        console.log('Error',error);
        process.exit(1); 
    }

  
}

// app.get('/book', (req, res)=>{
//  res.json({'message':'welcome to home page'})
// })


startServer(); 
