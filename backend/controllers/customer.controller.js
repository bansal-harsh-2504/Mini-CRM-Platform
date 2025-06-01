import Customer from "../models/Customer.js";

export const ingestCustomers = async (req, res) => {
  let customers = req.body.type;
  if (!Array.isArray(customers)) customers = [customers];

  for (const cust of customers) {
    if (!cust.email || !cust.name) {
      return res.status(400).json({
        success: false,
        message: "Name and Email are required for all customers.",
      });
    }
  }

  try {
    const operations = customers.map((cust) => ({
      updateOne: {
        filter: { owner: req.userId, email: cust.email },
        update: { $set: { ...cust, owner: req.userId } },
        upsert: true,
      },
    }));
    await Customer.bulkWrite(operations);
    res.status(200).json({
      success: true,
      message: `${customers.length} customers ingested`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
