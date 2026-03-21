require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const reportsRoutes = require("./routes/reports");
const leadsRoutes = require("./routes/leads");
const projectsRoutes = require("./routes/projects");
const expensesRoutes = require("./routes/expenses");
const paymentsRoutes = require("./routes/payments");
const usersRoutes = require("./routes/users");
const settingsRoutes = require("./routes/settings");
const vendorsRoutes = require("./routes/vendors");
const billsRoutes = require("./routes/bills");
var bodyParser = require("body-parser");
const multer = require("multer");

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);



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
app.use(
  bodyParser.json({
    strict: false,
    verify: (req, res, buf) => {
      // Save raw body for debugging invalid JSON payloads
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());

// Improved JSON parsing error handling
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('JSON parse error - raw body:', req.rawBody);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

app.use(cors());

app.get("/", (req, res) => {
  res.send({ hello: "world" });
});




const port = process.env.PORT || 5000;
const dbURI =
  "mongodb+srv://Aditya:Aditya@cluster0.atrko.mongodb.net/Acons?retryWrites=true&w=majority";

const User = require("./model/user");
const Expense = require("./model/expense");
const Payment = require("./model/payment");

mongoose.connect(dbURI)
  .then(async () => {
    console.log("connected");
    // Check if user collection is empty and create admin if needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminUser = new User({
        name: "Admin",
        email: "admin@aditya.com",
        password: "admin123", // You may want to change this after first login
        countryCode: "+91",
        mobilenumber: 9999999999
      });
      await adminUser.save();
      console.log("Admin user created: admin@aditya.com / admin123");
    }
    // Ensure expenses collection exists
    try {
      await Expense.create({ title: 'dummy', amount: 0 });
      await Expense.deleteOne({ title: 'dummy' });
      console.log("Expenses collection initialized");
    } catch (err) {
      console.log("Expenses collection ready:", err.message);
    }
    // Ensure payments collection exists
    try {
      await Payment.create({ title: 'dummy', amount: 0 });
      await Payment.deleteOne({ title: 'dummy' });
      console.log("Payments collection initialized");
    } catch (err) {
      console.log("Payments collection ready:", err.message);
    }
    app.listen(port);
  })
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/vendors", vendorsRoutes);
app.use("/api/bills", billsRoutes);
