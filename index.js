const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const servicesRoutes = require("./routes/services");
const userRoutes = require("./routes/profile");
const blogRoutes = require("./routes/blog");

// Mongo DB
mongoose
  .connect(process.env.MONGO_DB_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());

// Routes
// Base route
app.get("/", (req, res) => {
  res.send("Dominican Media is Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Dominican Media Server is running on port ${PORT}`);
});
