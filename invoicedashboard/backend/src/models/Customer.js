const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ name: 1 });
customerSchema.index({ company: 1 });

module.exports = mongoose.model('Customer', customerSchema);