import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

export const ingestOrders = async (req, res) => {
  let { orders } = req.body;
  if (!Array.isArray(orders)) orders = [orders];

  for (const order of orders) {
    if (!order.customerEmail || !order.orderDate || !order.amount) {
      return res.status(400).json({
        success: false,
        message: "Each order must have customerEmail and orderDate and amount",
      });
    }
  }

  try {
    const emails = [...new Set(orders.map((o) => o.customerEmail))];
    const customers = await Customer.find({
      owner: req.userId,
      email: { $in: emails },
    }).select("_id email");

    const emailToCustomerId = {};
    customers.forEach((cust) => {
      emailToCustomerId[cust.email] = cust._id;
    });

    const operations = [];

    for (const order of orders) {
      const customerId = emailToCustomerId[order.customerEmail];
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: `Customer with email ${order.customerEmail} not found`,
        });
      }

      operations.push({
        updateOne: {
          filter: { orderId: order.orderId, customerId, owner: req.userId },
          update: {
            $set: { ...order, customerId, owner: req.userId },
          },
          upsert: true,
        },
      });
    }

    await Order.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: `${orders.length} orders ingested`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
