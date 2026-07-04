require("dotenv").config();
const mongoose = require("mongoose");
const Customer = require("./models/Customer");
const Visitor = require("./models/Visitor");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding data...");

  await Customer.deleteMany({});
  await Visitor.deleteMany({});

  const customers = await Customer.insertMany([
    { name: "Ayesha Khan", email: "ayesha@brightco.com", phone: "0300-1234567", company: "BrightCo", status: "ACTIVE" },
    { name: "Bilal Ahmed", email: "bilal@nexuspk.com", phone: "0321-9876543", company: "Nexus PK", status: "ACTIVE" },
    { name: "Sara Malik", email: "sara@retailhub.com", phone: "0333-4455667", company: "RetailHub", status: "INACTIVE" },
  ]);

  await Visitor.insertMany([
    { name: "Usman Tariq", phone: "0301-1112223", personToMeet: "Ayesha Khan", purpose: "Business Meeting" },
    { name: "Fatima Noor", phone: "0345-6667778", personToMeet: "Bilal Ahmed", purpose: "Interview" },
  ]);

  console.log(`Seeded ${customers.length} customers and 2 visitors.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
