const config = require("../../config");
const Subscriber = require("../../modules/subscriber/subscriber.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.emailAddress,
    pass: config.email.emailPass,
  },
});

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "Email already subscribed" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    const mailOptions = {
      from: config.email.emailAddress,
      to: email,
      subject: "Welcome to Our Newsletter",
      text: "Thank you for subscribing to our newsletter!",
      html: "<h1>Thank you for subscribing!</h1><p>You will now receive our latest updates.</p>",
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Subscription successful",
      subscriber: newSubscriber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Subscription failed",
      error: error.message,
    });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOneAndUpdate(
      { email },
      { isActive: false },
      { new: true }
    );

    if (!subscriber) {
      return res
        .status(404)
        .json({ message: "Email not found in subscribers" });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unsubscription failed", error: error.message });
  }
};

// Get all subscribers (with pagination)
// const getSubscribers = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const subscribers = await Subscriber.find({})
//       .sort({ subscribedAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Subscriber.countDocuments();
//     const totalPages = Math.ceil(total / limit);

//     res.status(200).json({
//       success: true,
//       message: "Subscribers fetched successfully",
//       data: subscribers,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalSubscribers: total,
//         hasNextPage: page < totalPages,
//         hasPreviousPage: page > 1,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching subscribers",
//       error: error.message,
//     });
//   }
// };


const getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const dateFilter = req.query.dateFilter || ""; // thisMonth, lastMonth, lastYear

    // Build query
    const query = {};
    if (search.trim() !== "") {
      query.email = { $regex: search, $options: "i" };
    }

    // Date filter
    if (dateFilter) {
      const now = new Date();
      let startDate, endDate;

      if (dateFilter === "thisMonth") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (dateFilter === "lastMonth") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      } else if (dateFilter === "lastYear") {
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      }

      if (startDate && endDate) {
        query.subscribedAt = { $gte: startDate, $lte: endDate };
      }
    }

    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscriber.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Subscribers fetched successfully",
      data: subscribers,
      pagination: {
        currentPage: page,
        totalPages,
        totalSubscribers: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subscribers",
      error: error.message,
    });
  }
};




const sendEmailToSubscribers = async (req, res) => {
  try {
    const { subject, text, html } = req.body;

    if (!subject || (!text && !html)) {
      return res
        .status(400)
        .json({ message: "Subject and content are required" });
    }

    const activeSubscribers = await Subscriber.find({ isActive: true });
    const emails = activeSubscribers.map((sub) => sub.email);

    if (emails.length === 0) {
      return res.status(400).json({ message: "No active subscribers found" });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      bcc: emails,
      subject,
      text: text || "",
      html: html || "",
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Email sent to ${emails.length} subscribers`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending emails", error: error.message });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendEmailToSubscribers,
};
