require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Customer = require('../src/models/Customer');
const Invoice = require('../src/models/Invoice');

const DATA_PATH = path.join(__dirname, 'seed-data.json');

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const seed = async () => {
  await connect();

  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const records = JSON.parse(raw);
  console.log(`📦 Loaded ${records.length} records from seed-data.json`);

  // ── Step 1: upsert unique customers ──────────────────────
  const customerMap = new Map(); // name → _id

  const uniqueCustomers = [
    ...new Map(records.map((r) => [r.customer, r])).values(),
  ].map((r) => ({ name: r.customer, company: r.company }));

  let custInserted = 0;
  let custUpdated = 0;

  for (const c of uniqueCustomers) {
    const doc = await Customer.findOneAndUpdate(
      { name: c.name },
      { $set: c },
      { upsert: true, new: true }
    );
    customerMap.set(c.name, doc._id);
    if (doc.createdAt?.getTime() === doc.updatedAt?.getTime()) {
      custInserted++;
    } else {
      custUpdated++;
    }
  }

  console.log(
    `👤 Customers — ${custInserted} inserted, ${custUpdated} updated`
  );

  // ── Step 2: upsert invoices ───────────────────────────────
  let invInserted = 0;
  let invUpdated = 0;
  let invErrors = 0;

  for (const r of records) {
    const customerId = customerMap.get(r.customer);
    if (!customerId) {
      console.warn(`⚠️  No customer found for: ${r.customer}`);
      invErrors++;
      continue;
    }

    const payload = {
      invoiceId: r.invoiceId,
      customerId,
      customer: r.customer,
      company: r.company,
      amount: r.amount,
      taxRate: r.taxRate,
      tax: r.tax,
      total: r.total,
      status: r.status,
      issueDate: new Date(r.issueDate),
      dueDate: new Date(r.dueDate),
    };

    try {
      const before = await Invoice.findOne({ invoiceId: r.invoiceId });
      await Invoice.findOneAndUpdate(
        { invoiceId: r.invoiceId },
        { $set: payload },
        { upsert: true, new: true }
      );
      if (before) {
        invUpdated++;
      } else {
        invInserted++;
      }
    } catch (err) {
      console.error(`❌ Failed on ${r.invoiceId}: ${err.message}`);
      invErrors++;
    }
  }

  console.log(
    `🧾 Invoices — ${invInserted} inserted, ${invUpdated} updated, ${invErrors} errors`
  );
  console.log('✅ Seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});