const {cloudinary}  = require("./utils/cloudinary");
const express = require("express");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ugsfy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

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
    const event = (req.body);
    eventsCollection.insertOne(event).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
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

app.post("/api/upload", async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "volunter_img",
      width:180,
      height:260,
    });
    console.log(uploadResponse);
    res.json({ url: `${uploadResponse.url}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
