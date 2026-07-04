const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    personToMeet: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
