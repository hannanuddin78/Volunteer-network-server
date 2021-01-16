const express = require("express");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ugsfy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const eventsCollection = client.db("volunteerEventDb").collection("events");
  const registerEventCollection = client
    .db("volunteerEventDb")
    .collection("registerOrder");
  console.log("database connect");

  app.post("/addEvent", (req, res) => {
    const event = req.body;
    eventsCollection.insertMany(event).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount);
    });
  });

  app.get("/events", (req, res) => {
    eventsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/events/:eventId", (req, res) => {
    eventsCollection
      .find({ eventId: req.params.eventId })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post("/registerEvent", (req, res) => {
    const registerEvent = req.body;
    console.log(registerEvent);
    registerEventCollection.insertOne(registerEvent).then((result) => {
      console.log(result);
      res.send(result);
    });
  });

  app.get("/seeEvents", (req, res) => {
    registerEventCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.delete("/delete/:eventId", (req, res) => {
    console.log(req.params.eventId);
    registerEventCollection
      .deleteOne({ _id: ObjectId(req.params.eventId) })
      .then((result) => {
        console.log(result);
        res.send(result);
      });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
