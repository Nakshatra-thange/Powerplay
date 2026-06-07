const express = require('express');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

router.get('/top5', async (req, res, next) => {
  try {
    const customers = await Invoice.aggregate([
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customer' },
          company: { $first: '$company' },
          totalInvoiced: { $sum: '$total' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalInvoiced: -1 } },
      { $limit: 5 },
    ]);
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: true, message: 'Customer not found' });

    const [summary] = await Invoice.aggregate([
      { $match: { customerId: customer._id } },
      {
        $group: {
          _id: '$customerId',
          totalInvoiced: { $sum: '$total' },
          totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$total', 0] } },
          totalOutstanding: {
            $sum: {
              $cond: [{ $in: ['$status', ['Sent', 'Unpaid', 'Overdue']] }, '$total', 0],
            },
          },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);

    const [data, total] = await Promise.all([
      Invoice.find({ customerId: customer._id })
        .sort({ issueDate: -1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Invoice.countDocuments({ customerId: customer._id }),
    ]);

    res.json({
      customer,
      metrics: {
        totalInvoiced: summary?.totalInvoiced || 0,
        totalPaid: summary?.totalPaid || 0,
        totalOutstanding: summary?.totalOutstanding || 0,
        invoiceCount: summary?.invoiceCount || 0,
      },
      invoices: {
        data,
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
