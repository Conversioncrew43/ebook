const nodemailer = require('nodemailer');

// Create transporter (using Gmail as example - configure as needed)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP settings
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  // Add debug options
  debug: true,
  logger: true
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error.message);
    console.log('Please check your EMAIL_USER and EMAIL_PASS in .env file');
  } else {
    console.log('✅ Email service ready - emails will be sent successfully');
  }
});

const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcomeUser: (user, plainPassword) => ({
    subject: 'Welcome to Aditya Construction',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Dear ${user.name},</h2>

        <p style="font-size: 16px; line-height: 1.6;">Welcome to <strong>Aditya Construction</strong>! 🎉</p>

        <p style="font-size: 16px; line-height: 1.6;">Your account has been successfully created, and you are now part of our system. You can start accessing your dashboard and managing your assigned tasks right away.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <h3 style="color: #007bff;">🔐 Your Login Details</h3>

        <p style="font-size: 16px; line-height: 1.6;"><strong>Email:</strong> ${user.email}</p>
        <p style="font-size: 16px; line-height: 1.6;"><strong>Password:</strong> ${plainPassword || 'Please contact admin for password'}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <h3 style="color: #007bff;">🌐 Login Here</h3>

        <p style="font-size: 16px; line-height: 1.6;">Click the link below to access your account:</p>

        <p style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Your Account</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <h3 style="color: #dc3545;">⚠️ Important</h3>

        <p style="font-size: 16px; line-height: 1.6;">For security reasons, we strongly recommend that you <strong>change your password after your first login</strong>.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <p style="font-size: 16px; line-height: 1.6;">If you face any issues logging in or need assistance, feel free to contact the admin.</p>

        <p style="font-size: 16px; line-height: 1.6;">We're excited to have you onboard and look forward to working together!</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <p style="font-size: 16px; line-height: 1.6;">Best regards,<br><strong>Aditya Construction Team</strong></p>
      </div>
    `,
    text: `Dear ${user.name},

Welcome to Aditya Construction! 🎉

Your account has been successfully created, and you are now part of our system. You can start accessing your dashboard and managing your assigned tasks right away.

---

🔐 Your Login Details

Email: ${user.email}
Password: ${plainPassword || 'Please contact admin for password'}

---

🌐 Login Here

${process.env.FRONTEND_URL}/login

---

⚠️ Important

For security reasons, we strongly recommend that you change your password after your first login.

---

If you face any issues logging in or need assistance, feel free to contact the admin.

We're excited to have you onboard and look forward to working together!

---

Best regards,
Aditya Construction Team`
  }),

  projectAssigned: (user, project) => ({
    subject: `New Project Assigned: ${project.projectName}`,
    html: `
      <h1>Project Assignment</h1>
      <p>Hello ${user.name},</p>
      <p>You have been assigned to a new project:</p>
      <ul>
        <li><strong>Project:</strong> ${project.projectName}</li>
        <li><strong>Client:</strong> ${project.clientName}</li>
        <li><strong>Status:</strong> ${project.status}</li>
        <li><strong>Budget:</strong> ₹${project.budget || 'N/A'}</li>
      </ul>
      <p>Please check your dashboard for more details.</p>
      <br>
      <p>Best regards,<br>Aditya Construction Team</p>
    `,
    text: `Hello ${user.name}, you have been assigned to project: ${project.projectName}`
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Aditya Construction Team</p>
    `,
    text: `Password reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
  }),

  billGenerated: (client, bill) => ({
    subject: `New Bill Generated: ${bill.billNumber}`,
    html: `
      <h1>Bill Generated</h1>
      <p>Hello ${client.name},</p>
      <p>A new bill has been generated for your project:</p>
      <ul>
        <li><strong>Bill Number:</strong> ${bill.billNumber}</li>
        <li><strong>Title:</strong> ${bill.title}</li>
        <li><strong>Amount:</strong> ₹${bill.totalAmount}</li>
        <li><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please check your dashboard for bill details and payment options.</p>
      <br>
      <p>Best regards,<br>Aditya Construction Team</p>
    `,
    text: `New bill ${bill.billNumber} for ₹${bill.totalAmount} is ready.`
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};