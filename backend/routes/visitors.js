const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Visitor = require("../models/Visitor");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// POST /api/visitors/checkin
router.post(
  "/checkin",
  [
    body("name").trim().notEmpty().withMessage("Visitor name is required."),
    body("phone")
      .matches(/^[0-9+\-\s()]{7,20}$/)
      .withMessage("A valid phone number is required."),
    body("personToMeet").trim().notEmpty().withMessage("Person to meet is required."),
    body("purpose").trim().notEmpty().withMessage("Purpose of visit is required."),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, phone, personToMeet, purpose } = req.body;
      const visitor = await Visitor.create({
        name,
        phone,
        personToMeet,
        purpose,
        checkInTime: new Date(),
      });
      res.status(201).json(visitor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to check in visitor." });
    }
  }
);

// PUT /api/visitors/:id/checkout
router.put("/:id/checkout", async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found." });
    }
    if (visitor.checkOutTime) {
      return res.status(400).json({ error: "Visitor is already checked out." });
    }

    visitor.checkOutTime = new Date();
    await visitor.save();
    res.json(visitor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check out visitor." });
  }
});

// GET /api/visitors/history?search=&page=&limit=
router.get(
  "/history",
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
              { personToMeet: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      const [visitors, total] = await Promise.all([
        Visitor.find(filter)
          .sort({ checkInTime: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Visitor.countDocuments(filter),
      ]);

      res.json({
        data: visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch visitor history." });
    }
  }
);

// GET /api/visitors/stats  (for dashboard cards)
router.get("/stats", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [visitorsToday, checkedIn] = await Promise.all([
      Visitor.countDocuments({ checkInTime: { $gte: startOfDay } }),
      Visitor.countDocuments({ checkOutTime: null }),
    ]);

    res.json({ visitorsToday, checkedInVisitors: checkedIn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch visitor stats." });
  }
});

module.exports = router;
