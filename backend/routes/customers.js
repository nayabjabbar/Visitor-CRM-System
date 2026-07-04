const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Customer = require("../models/Customer");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth); // all customer routes require login

const customerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("A valid email is required."),
  body("phone")
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("A valid phone number is required."),
  body("company").optional({ checkFalsy: true }).trim(),
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// GET /api/customers?search=&page=&limit=
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { search = "" } = req.query;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const filter = search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { company: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      const [customers, total] = await Promise.all([
        Customer.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Customer.countDocuments(filter),
      ]);

      res.json({
        data: customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch customers." });
    }
  }
);

// GET /api/customers/stats  (for dashboard cards)
router.get("/stats", async (req, res) => {
  try {
    const [total, active] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: "ACTIVE" }),
    ]);
    res.json({ totalCustomers: total, activeCustomers: active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customer stats." });
  }
});

// POST /api/customers
router.post("/", customerValidation, handleValidation, async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "A customer with this email already exists." });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      status: status || "ACTIVE",
    });
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create customer." });
  }
});

// PUT /api/customers/:id
router.put("/:id", customerValidation, handleValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status } = req.body;

    const duplicate = await Customer.findOne({
      email: email.toLowerCase(),
      _id: { $ne: id },
    });
    if (duplicate) {
      return res.status(409).json({ error: "Another customer already uses this email." });
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { name, email, phone, company, status },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update customer." });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    res.json({ message: "Customer deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete customer." });
  }
});

module.exports = router;
