const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Subscribe to newsletter
const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        // Send welcome email
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Welcome to Our Newsletter',
            text: 'Thank you for subscribing to our newsletter!',
            html: '<h1>Thank you for subscribing!</h1><p>You will now receive our latest updates.</p>'
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Subscription successful', subscriber: newSubscriber });
    } catch (error) {
        res.status(500).json({ message: 'Subscription failed', error: error.message });
    }
};

// Unsubscribe from newsletter
const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        const subscriber = await Subscriber.findOneAndUpdate(
            { email },
            { isActive: false },
            { new: true }
        );

        if (!subscriber) {
            return res.status(404).json({ message: 'Email not found in subscribers' });
        }

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Unsubscription failed', error: error.message });
    }
};

// Get all subscribers (with pagination)
const getSubscribers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const subscribers = await Subscriber.find({})
            .sort({ subscribedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Subscriber.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            subscribers,
            pagination: {
                currentPage: page,
                totalPages,
                totalSubscribers: total,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
    }
};

// Send email to subscribers
const sendEmailToSubscribers = async (req, res) => {
    try {
        const { subject, text, html } = req.body;

        if (!subject || (!text && !html)) {
            return res.status(400).json({ message: 'Subject and content are required' });
        }

        const activeSubscribers = await Subscriber.find({ isActive: true });
        const emails = activeSubscribers.map(sub => sub.email);

        if (emails.length === 0) {
            return res.status(400).json({ message: 'No active subscribers found' });
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            bcc: emails, // Using BCC to hide subscriber emails from each other
            subject,
            text: text || '',
            html: html || ''
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: `Email sent to ${emails.length} subscribers` });
    } catch (error) {
        res.status(500).json({ message: 'Error sending emails', error: error.message });
    }
};

module.exports = {
    subscribe,
    unsubscribe,
    getSubscribers,
    sendEmailToSubscribers
};