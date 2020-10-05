const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

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
    registerEventCollection.insertOne(registerEvent).then((result) => {
      res.send(result.insertedCount > 0);
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
    registerEventCollection
      .deleteOne({ eventId: req.params.eventId })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port);
