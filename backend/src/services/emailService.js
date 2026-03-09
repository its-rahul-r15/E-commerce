import nodemailer from 'nodemailer';

/**
 * Email Service — sends emails via SMTP (Gmail / any provider)
 * 
 * Required .env vars:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 *   SMTP_FROM="Klyra <your-email@gmail.com>"
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a loyalty coupon email to a customer
 */
export const sendLoyaltyCouponEmail = async (to, userName, couponCode, discountValue, discountType, expiryDate) => {
    const discountText = discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`;
    const expiryText = new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf9f7; border: 1px solid #e5e0d8;">
        <div style="background: #1a2332; padding: 30px; text-align: center;">
            <h1 style="color: #d4af37; font-size: 28px; margin: 0; letter-spacing: 4px;">KLYRA</h1>
            <p style="color: #ffffff80; font-size: 10px; letter-spacing: 3px; margin-top: 5px;">EXCLUSIVE REWARD</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
            <p style="color: #1a2332; font-size: 16px; margin-bottom: 5px;">Dear <strong>${userName}</strong>,</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Thank you for being a valued Klyra customer! As a token of our appreciation, 
                here's an exclusive discount coupon just for you.
            </p>
            <div style="background: #1a2332; margin: 30px 0; padding: 25px; border: 2px solid #d4af37;">
                <p style="color: #d4af37; font-size: 12px; letter-spacing: 3px; margin: 0 0 10px;">YOUR EXCLUSIVE CODE</p>
                <h2 style="color: #ffffff; font-size: 32px; letter-spacing: 6px; margin: 0; font-weight: bold;">${couponCode}</h2>
                <p style="color: #d4af37; font-size: 24px; margin: 15px 0 5px; font-weight: bold;">${discountText} OFF</p>
                <p style="color: #ffffff80; font-size: 11px; margin: 0;">Valid until ${expiryText}</p>
            </div>
            <p style="color: #888; font-size: 12px;">
                Apply this code at checkout to enjoy your reward. This is our way of saying thank you! 🙏
            </p>
        </div>
        <div style="background: #1a2332; padding: 15px; text-align: center;">
            <p style="color: #ffffff50; font-size: 10px; letter-spacing: 2px; margin: 0;">KLYRA — CURATED ELEGANCE</p>
        </div>
    </div>`;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Klyra" <noreply@klyra.in>',
        to,
        subject: `🎁 Exclusive ${discountText} OFF — Your Klyra Loyalty Reward!`,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Loyalty coupon sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`[EMAIL] Failed to send to ${to}:`, error.message);
        return false;
    }
};
