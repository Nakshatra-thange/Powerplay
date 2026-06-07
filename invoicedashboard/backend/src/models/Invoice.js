const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: [true, 'Invoice ID is required'],
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    // Denormalized for fast list queries (no $lookup needed)
    customer: { type: String, required: true, trim: true },
    company:  { type: String, required: true, trim: true },

    amount:  { type: Number, required: true, min: 0 },
    taxRate: { type: Number, enum: [0, 3, 5, 18, 28], required: true },
    tax:     { type: Number, required: true, min: 0 },
    total:   { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['Sent', 'Unpaid', 'Overdue', 'Paid', 'Void', 'Draft'],
      required: true,
      default: 'Draft',
    },

    issueDate: { type: Date, required: true },
    dueDate:   { type: Date, required: true },
  },
  { timestamps: true }
);

// Indexes for all filter/sort operations
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ issueDate: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ amount: 1 });
// Compound: customer profile invoice history (sorted by date)
invoiceSchema.index({ customerId: 1, issueDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);