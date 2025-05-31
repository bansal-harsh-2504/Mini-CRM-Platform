import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  const { customerId, amount } = req.body;
  try {
    const order = await Order.create({
      customerId,
      amount,
      date: new Date(),
      owner: req.userId,
    });
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ owner: req.userId });
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrdersByCustomerId = async (req, res) => {
  const { customerId } = req.params;
  try {
    const orders = await Order.find({ customerId, owner: req.userId });
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findOne({ _id: id, owner: req.userId }).populate(
      "customerId",
      "name email"
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
