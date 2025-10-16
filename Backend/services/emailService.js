import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,   
    pass: process.env.EMAIL_PASS,   
  },
});

/**
 * @param {object} tripData - Contains user and payment details.
 */
export const sendTripReceipt = async (tripData) => {
  if (!tripData.user || !tripData.paymentId) {
    console.error("Missing user or payment data for receipt.");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: tripData.user.email,
    subject: `✅ Receipt for your Ride with Uber Clone - Order ${tripData.paymentId}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h2 style="color: #10B981;">Trip Receipt - Payment Confirmed</h2>
        <p>Hi ${tripData.user.fullname.firstname},</p>
        <p>Thank you for riding with us! Your payment has been successfully processed.</p>
        
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9;">
          <p><strong>Date:</strong> ${new Date(tripData.completedAt).toLocaleString()}</p>
          <p><strong>Payment ID:</strong> ${tripData.paymentId}</p>
          <p><strong>Total Fare:</strong> <span style="font-size: 18px; color: #10B981; font-weight: bold;">₹${tripData.fare.toFixed(2)}</span></p>
        </div>
        
        <div style="margin-top: 20px;">
          <p><strong>Pickup:</strong> ${tripData.pickup.address}</p>
          <p><strong>Destination:</strong> ${tripData.destination.address}</p>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          This is an automated receipt. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Receipt Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
};
