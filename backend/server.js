require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Visitor CRM API running on http://localhost:${PORT}`);
});