// controllers/dashboard.controller.js
const mongoose = require("mongoose");
const Order = require("../order/order.model"); // adjust path if needed
const Payment = require("../payment/payment.model"); // adjust path if needed
const Product = require("../product/product.model");
const Category = require("../category/category.model");
const User = require("../user/user.model");

/**
 * Helper: sum successful payments; fallback to paid orders if no payments exist
 */
async function getTotalRevenue() {
  // Prefer Payment records marked success (less risk of counting pending/failed)
  const paymentAgg = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  if (paymentAgg && paymentAgg[0] && paymentAgg[0].total) {
    return paymentAgg[0].total;
  }

  // Fallback: sum orders with paymentStatus 'Paid'
  const ordersAgg = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    {
      $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", 0] } } },
    },
  ]);
  return (ordersAgg[0] && ordersAgg[0].total) || 0;
}

/**
 * GET /api/admin/dashboard/summary
 * Returns totals: totalRevenue, totalOrders, activeUsers, conversionRate
 */
exports.getSummary = async (req, res) => {
  try {
    const [totalRevenue, totalOrders, activeUsers, totalUsers] =
      await Promise.all([
        getTotalRevenue(),
        Order.countDocuments({}),
        User.countDocuments({ isActive: true }),
        User.countDocuments({}),
      ]);

    // Conversion rate = percentage of users who made at least one paid order
    const paidBuyersAgg = await Order.aggregate([
      {
        $match: { paymentStatus: "Paid", userId: { $exists: true, $ne: null } },
      },
      { $group: { _id: "$userId" } },
      { $count: "buyerCount" },
    ]);
    const buyers = (paidBuyersAgg[0] && paidBuyersAgg[0].buyerCount) || 0;
    const conversionRate =
      totalUsers === 0 ? 0 : Number(((buyers / totalUsers) * 100).toFixed(2));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        activeUsers,
        totalUsers,
        conversionRate, // percentage e.g. 30.00
        buyers,
      },
    });
  } catch (err) {
    console.error("dashboard summary error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/sales-overview?months=12
 * Monthly series for last `months` months (default 12)
 */
exports.getSalesOverview = async (req, res) => {
  try {
    const months = parseInt(req.query.months, 10) || 12;
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1),
      1,
      0,
      0,
      0,
      0
    );

    // Aggregate orders by year-month
    const agg = await Order.aggregate([
      { $match: { purchaseDate: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
          },
          totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalSales: 1,
          ordersCount: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Build full months list with zero-fills
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const found = agg.find((a) => a.year === year && a.month === month);
      result.push({
        year,
        month,
        monthLabel: d.toLocaleString("default", { month: "short" }), // Jan, Feb ...
        totalSales: found ? found.totalSales : 0,
        ordersCount: found ? found.ordersCount : 0,
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("sales overview error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/sales-by-category
 * Returns: [{ categoryId, categoryName, totalSales, ordersCount, percent }]
 */
exports.getSalesByCategory = async (req, res) => {
  try {
    // Aggregate orders by product -> product.category
    // We assume order.product is a product reference for each order.
    // If you store multiple products per order in cartItems with product ids, adjust accordingly.
    const agg = await Order.aggregate([
      // Only orders that have product ref and a totalAmount
      { $match: { product: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: {
            $ifNull: ["$category.categoryName", "Uncategorized"],
          },
          image: "$category.image",
          totalSales: 1,
          ordersCount: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    const totalAll = agg.reduce((s, a) => s + (a.totalSales || 0), 0);

    const mapped = agg.map((a) => ({
      categoryId: a.categoryId,
      categoryName: a.categoryName,
      image: a.image || null,
      totalSales: a.totalSales,
      ordersCount: a.ordersCount,
      percent:
        totalAll === 0
          ? 0
          : Number(((a.totalSales / totalAll) * 100).toFixed(2)),
    }));

    res.json({ success: true, data: mapped, totalAll });
  } catch (err) {
    console.error("sales by category error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/top-products?limit=5
 * Returns top products by revenue
 */
exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    // Aggregate by order.product
    const agg = await Order.aggregate([
      { $match: { product: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$product",
          revenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
          salesCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          slug: "$product.slug",
          photo: "$product.photo",
          category: "$product.category",
          revenue: 1,
          salesCount: 1,
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);

    res.json({ success: true, data: agg });
  } catch (err) {
    console.error("top products error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/recent-orders?limit=10
 * Returns recent orders (populated)
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "product", select: "name photo category" })
      .populate({
        path: "userId",
        select: "userName email firstName lastName imageLink",
      })
      .lean();

    // Map to frontend-friendly shape
    const mapped = orders.map((o) => ({
      id: o._id,
      orderNumber: o._id, // or generate a readable #1220 style from some field
      user: o.userId
        ? {
            id: o.userId._id,
            userName: o.userId.userName,
            email: o.userId.email,
            name: `${o.userId.firstName || ""} ${
              o.userId.lastName || ""
            }`.trim(),
            image: o.userId.imageLink || null,
          }
        : null,
      product: o.product
        ? {
            id: o.product._id,
            name: o.product.name,
            photo: Array.isArray(o.product.photo) ? o.product.photo[0] : null,
          }
        : null,
      cartItems: o.cartItems || [],
      totalAmount: o.totalAmount || 0,
      status: o.status || o.paymentStatus || "Pending",
      paymentMethod: o.paymentMethod || null,
      purchaseDate: o.purchaseDate || o.createdAt,
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    console.error("recent orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
