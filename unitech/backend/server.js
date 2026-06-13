require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");



const app = express();

// Kết nối Mongo
connectDB();

app.use(cors());

app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/majors", require("./routes/majorRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/periods", require("./routes/periodRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reports",       require("./routes/reportRoutes"));

app.use(require("./middleware/error"));

app.get("/", (_, res) => res.send("API is up"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
