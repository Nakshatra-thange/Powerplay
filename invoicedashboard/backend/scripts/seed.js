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

  const uniqueCustomers = [
    ...new Map(records.map((r) => [r.customer, r])).values(),
  ].map((r) => ({ name: r.customer, company: r.company }));

  const customerResult = await Customer.bulkWrite(
    uniqueCustomers.map((c) => ({
      updateOne: {
        filter: { name: c.name },
        update: { $set: c },
        upsert: true,
      },
    }))
  );

  const customers = await Customer.find({
    name: { $in: uniqueCustomers.map((c) => c.name) },
  });
  const customerMap = new Map(customers.map((c) => [c.name, c._id]));

  console.log(
    `👤 Customers — ${customerResult.upsertedCount} inserted, ${customerResult.modifiedCount} updated`
  );

  // ── Step 2: upsert invoices ───────────────────────────────
  let invErrors = 0;
  const invoiceOps = [];

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

    invoiceOps.push({
      updateOne: {
        filter: { invoiceId: r.invoiceId },
        update: { $set: payload },
        upsert: true,
      },
    });
  }

  const invoiceResult = invoiceOps.length
    ? await Invoice.bulkWrite(invoiceOps, { ordered: false })
    : { upsertedCount: 0, modifiedCount: 0 };

  console.log(
    `🧾 Invoices — ${invoiceResult.upsertedCount} inserted, ${invoiceResult.modifiedCount} updated, ${invErrors} errors`
  );
  console.log('✅ Seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
