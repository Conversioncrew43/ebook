const User = require('../model/user');
const { emailTemplates, sendEmail } = require('../utils/email');

exports.create = async (req, res) => {
  try {
    const userData = req.body;
    const plainPassword = userData.password; // Store plain password before hashing

    const user = await User.create(userData);

    // Send welcome email with plain password
    try {
      const template = emailTemplates.welcomeUser(user, plainPassword);
      await sendEmail(user.email, template.subject, template.html, template.text);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create user' });
  }
};

exports.list = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.get = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user' });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.update = async (req, res) => {
  try {
    // Prevent role update if not admin
    if (req.body.role !== undefined) {
      // You can add more robust admin check here (e.g., req.user.role === 'admin')
      return res.status(403).json({ message: 'You are not allowed to edit roles.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user' });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};