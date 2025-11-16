require("dotenv").config();
const mongoose = require("mongoose");

// Load Mongo URI
const mongoUri = process.env.MONGO_URI;
console.log("Mongo URI →", mongoUri);

// Connect to MongoDB
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 60000, // 60 seconds
    socketTimeoutMS: 60000,  // 60 seconds
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Victim Schema
const victimSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  sos: [
    {
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
      battery: Number,
      type: {
        type: String,
        enum: ["Medical", "Food/Water", "Trapped", "Other"],
      },
      timestamp: { type: Date, default: Date.now },
      status: {
        type: String,
        default: "Pending", // Pending / Acknowledged / Resolved
      },
    },
  ],
});

// Responder Schema
const responderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["Volunteer", "Official"],
    default: "Volunteer",
  },

  assignedSOS: [
    {
      victimId: { type: mongoose.Schema.Types.ObjectId, ref: "Victim" },
      status: {
        type: String,
        default: "Assigned", // Assigned / In-Progress / Completed
      },
    },
  ],
});

// Export Models
const Responder = mongoose.model("Responder", responderSchema);
const Victim = mongoose.model("Victim", victimSchema);

module.exports = {
  Responder,
  Victim,
};
