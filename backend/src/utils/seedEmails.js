import EmailTemplate from '../models/EmailTemplate.js';

const DEFAULT_TEMPLATES = [
    {
        name: 'welcome',
        subject: 'Welcome to Klyra — Curated Elegance',
        variables: ['userName'],
        htmlBody: `<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf9f7; border: 1px solid #e5e0d8;">
    <div style="background: #1a2332; padding: 30px; text-align: center;">
        <h1 style="color: #d4af37; font-size: 28px; margin: 0; letter-spacing: 4px;">KLYRA</h1>
        <p style="color: #ffffff80; font-size: 10px; letter-spacing: 3px; margin-top: 5px;">CURATED ETHNIC ELEGANCE</p>
    </div>
    <div style="padding: 40px 30px; text-align: center; background: #ffffff;">
        <h2 style="color: #1a2332; font-size: 20px; font-weight: normal; margin-bottom: 20px;">Welcome, {userName}!</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
            Thank you for creating an account with Klyra. We are delighted to welcome you to our community of connoisseurs who appreciate the fine art of hand-crafted ethnic clothing and traditional attire.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 30px;">
            Explore our curated collections of premium Sarees, Suits, and Lehengas designed by master artisans.
        </p>
        <a href="http://localhost:5173/" style="background: #1a2332; color: #d4af37; border: 1px solid #d4af37; padding: 12px 30px; text-decoration: none; font-size: 12px; letter-spacing: 2px; font-weight: bold; display: inline-block; text-transform: uppercase;">
            Enter the Boutique
        </a>
    </div>
    <div style="background: #1a2332; padding: 20px; text-align: center;">
        <p style="color: #ffffff50; font-size: 10px; letter-spacing: 2px; margin: 0;">KLYRA — DESIGNED FOR ROYALS</p>
    </div>
</div>`
    },
    {
        name: 'order_confirmation',
        subject: 'Thank you for your order! Confirmation: #{orderId}',
        variables: ['userName', 'orderId', 'totalAmount'],
        htmlBody: `<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf9f7; border: 1px solid #e5e0d8;">
    <div style="background: #1a2332; padding: 30px; text-align: center;">
        <h1 style="color: #d4af37; font-size: 28px; margin: 0; letter-spacing: 4px;">KLYRA</h1>
        <p style="color: #ffffff80; font-size: 10px; letter-spacing: 3px; margin-top: 5px;">ORDER CONFIRMATION</p>
    </div>
    <div style="padding: 40px 30px; background: #ffffff;">
        <h2 style="color: #1a2332; font-size: 18px; font-weight: normal; margin-bottom: 20px; text-align: center;">Your Order is Confirmed!</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>{userName}</strong>,
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            We have received your order and are preparing to curate it with the utmost care. Your artisan piece will soon make its way to you.
        </p>
        <div style="background: #faf9f7; border: 1px solid #e5e0d8; padding: 20px; margin-bottom: 30px;">
            <table style="width: 100%; font-size: 13px; color: #555;">
                <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #1a2332;">Order ID:</td>
                    <td style="padding: 5px 0; text-align: right; font-family: monospace;">{orderId}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #1a2332;">Amount Paid:</td>
                    <td style="padding: 5px 0; text-align: right; color: #d4af37; font-weight: bold; font-size: 15px;">₹{totalAmount}</td>
                </tr>
            </table>
        </div>
        <div style="text-align: center;">
            <a href="http://localhost:5173/orders" style="background: #1a2332; color: #d4af37; border: 1px solid #d4af37; padding: 12px 30px; text-decoration: none; font-size: 12px; letter-spacing: 2px; font-weight: bold; display: inline-block; text-transform: uppercase;">
                Track Your Order
            </a>
        </div>
    </div>
    <div style="background: #1a2332; padding: 20px; text-align: center;">
        <p style="color: #ffffff50; font-size: 10px; letter-spacing: 2px; margin: 0;">KLYRA — DRESSED IN ROYALTY</p>
    </div>
</div>`
    },
    {
        name: 'order_cancellation',
        subject: 'Order #{orderId} Cancelled — Klyra Boutique',
        variables: ['userName', 'orderId'],
        htmlBody: `<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf9f7; border: 1px solid #e5e0d8;">
    <div style="background: #1a2332; padding: 30px; text-align: center;">
        <h1 style="color: #d4af37; font-size: 28px; margin: 0; letter-spacing: 4px;">KLYRA</h1>
        <p style="color: #ffffff80; font-size: 10px; letter-spacing: 3px; margin-top: 5px;">ORDER CANCELLATION</p>
    </div>
    <div style="padding: 40px 30px; background: #ffffff; text-align: center;">
        <h2 style="color: #c53030; font-size: 18px; font-weight: normal; margin-bottom: 20px;">Order Cancellation Notification</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: left;">
            Dear <strong>{userName}</strong>,
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 25px; text-align: left;">
            We want to inform you that your Klyra Order <strong>#{orderId}</strong> has been cancelled. Any payment made will be refunded to your original source of payment within 5-7 business days.
        </p>
        <p style="color: #777; font-size: 12px; margin-bottom: 30px;">
            If you did not request this cancellation or have questions, please reach out to our customer service desk.
        </p>
        <a href="http://localhost:5173/" style="background: #1a2332; color: #d4af37; border: 1px solid #d4af37; padding: 12px 30px; text-decoration: none; font-size: 12px; letter-spacing: 2px; font-weight: bold; display: inline-block; text-transform: uppercase;">
            Return to Boutique
        </a>
    </div>
    <div style="background: #1a2332; padding: 20px; text-align: center;">
        <p style="color: #ffffff50; font-size: 10px; letter-spacing: 2px; margin: 0;">KLYRA — QUALITY REDEFINED</p>
    </div>
</div>`
    }
];

export const seedEmailTemplates = async () => {
    try {
        for (const temp of DEFAULT_TEMPLATES) {
            const exists = await EmailTemplate.findOne({ name: temp.name });
            if (!exists) {
                console.log(`🌱 Seeding default email template: ${temp.name}`);
                await EmailTemplate.create(temp);
            }
        }
        console.log('✅ Default email templates checked/seeded successfully!');
    } catch (e) {
        console.error('❌ Error seeding email templates:', e);
    }
};
