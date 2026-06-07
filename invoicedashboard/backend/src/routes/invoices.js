const express = require('express');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

const router = express.Router();

const allowedSortFields = new Set(['amount', 'dueDate', 'issueDate']);
const allowedStatuses = new Set(['Sent', 'Unpaid', 'Overdue', 'Paid', 'Void', 'Draft']);

const toEndOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const buildInvoicePayload = async (body, existingInvoice = null) => {
  const customerId = body.customerId || existingInvoice?.customerId;
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
    const err = new Error('Valid customerId is required');
    err.status = 400;
    throw err;
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    const err = new Error('Customer not found');
    err.status = 404;
    throw err;
  }

  const amount = Number(body.amount ?? existingInvoice?.amount);
  const taxRate = Number(body.taxRate ?? existingInvoice?.taxRate);
  const status = body.status ?? existingInvoice?.status ?? 'Draft';
  const issueDate = body.issueDate ?? existingInvoice?.issueDate;
  const dueDate = body.dueDate ?? existingInvoice?.dueDate;

  if (!Number.isFinite(amount) || amount < 0) {
    const err = new Error('amount must be a non-negative number');
    err.status = 400;
    throw err;
  }
  if (![0, 3, 5, 18, 28].includes(taxRate)) {
    const err = new Error('taxRate must be one of 0, 3, 5, 18, 28');
    err.status = 400;
    throw err;
  }
  if (!allowedStatuses.has(status)) {
    const err = new Error('Invalid invoice status');
    err.status = 400;
    throw err;
  }
  if (!issueDate || !dueDate) {
    const err = new Error('issueDate and dueDate are required');
    err.status = 400;
    throw err;
  }

  const tax = Number(((amount * taxRate) / 100).toFixed(2));

  return {
    customerId: customer._id,
    customer: customer.name,
    company: customer.company,
    amount,
    taxRate,
    tax,
    total: Number((amount + tax).toFixed(2)),
    status,
    issueDate: new Date(issueDate),
    dueDate: new Date(dueDate),
  };
};

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const sortBy = allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : 'issueDate';
    const order = req.query.order === 'asc' ? 1 : -1;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.customer) query.customer = req.query.customer;
    if (req.query.issueDateFrom || req.query.issueDateTo) {
      query.issueDate = {};
      if (req.query.issueDateFrom) query.issueDate.$gte = new Date(req.query.issueDateFrom);
      if (req.query.issueDateTo) query.issueDate.$lte = toEndOfDay(req.query.issueDateTo);
    }
    if (req.query.dueDateFrom || req.query.dueDateTo) {
      query.dueDate = {};
      if (req.query.dueDateFrom) query.dueDate.$gte = new Date(req.query.dueDateFrom);
      if (req.query.dueDateTo) query.dueDate.$lte = toEndOfDay(req.query.dueDateTo);
    }

    const [data, total] = await Promise.all([
      Invoice.find(query).sort({ [sortBy]: order, _id: 1 }).skip((page - 1) * limit).limit(limit),
      Invoice.countDocuments(query),
    ]);

    res.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: true, message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = await buildInvoicePayload(req.body);
    const invoice = await Invoice.create({
      invoiceId: `INV-${Date.now()}`,
      ...payload,
    });
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const existingInvoice = await Invoice.findById(req.params.id);
    if (!existingInvoice) return res.status(404).json({ error: true, message: 'Invoice not found' });

    const payload = await buildInvoicePayload(req.body, existingInvoice);
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: true, message: 'Invoice not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
