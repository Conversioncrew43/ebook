const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const routs = require("./routes/routes");
var bodyParser = require("body-parser");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
  },
});
const upload = multer({ storage });

app.post("/upload-img", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const imageUrl = req.file.path; // The path to the uploaded image
  res.json({ imageUrl });
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());

app.get("/", (req, res) => {
  res.send({ hello: "world" });
});

const port = process.env.PORT || 3000;
const dbURI =
  "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/ajay?retryWrites=true&w=majority";
mongoose
  .connect(dbURI)
  .then((result) => console.log("connected"), app.listen(port))
  .catch((err) => console.log(err));

app.use("/api/conversion", routs);
