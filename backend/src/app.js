require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { notFound, errorHandler } = require('./middlewares/error.middleware');
const seoController = require('./controllers/seo.controller');

const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listing.routes');
const bookingRoutes = require('./routes/booking.routes');
const calendarRoutes = require('./routes/calendar.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
// Braintree goi webhook duoi dang application/x-www-form-urlencoded
// (bt_signature/bt_payload), khong phai JSON - can middleware nay rieng.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// O goc domain (khong phai /api) - dung chuan crawler/SEO tool tim dung vi
// tri. Xem comment day du trong seo.controller.js.
app.get('/robots.txt', seoController.robots);
app.get('/sitemap.xml', seoController.sitemap);

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
