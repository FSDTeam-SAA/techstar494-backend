// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();
const dashboardCtrl = require("../dashboard/dashboard.controller");

// Optionally you can add middleware checks here (auth/admin)
router.get("/summary", dashboardCtrl.getSummary);
router.get("/sales-overview", dashboardCtrl.getSalesOverview);
router.get("/sales-by-category", dashboardCtrl.getSalesByCategory);
router.get("/top-products", dashboardCtrl.getTopProducts);
router.get("/recent-orders", dashboardCtrl.getRecentOrders);

module.exports = router;
