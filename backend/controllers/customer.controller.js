import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
  const { name, email, phone, totalSpend, visits, lastActive } = req.body;
  try {
    const customer = await Customer.create({
      name,
      email,
      phone,
      totalSpend,
      visits,
      lastActive,
    });
    res.status(201).json({ success: true, data: { customer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json({ success: true, data: { customers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: { customer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
