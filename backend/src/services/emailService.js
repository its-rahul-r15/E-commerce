import nodemailer from 'nodemailer';
import EmailTemplate from '../models/EmailTemplate.js';

/**
 * Send email using Gmail SMTP (Nodemailer) as a fallback/alternative provider
 */
export const sendEmailViaSmtp = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const from = process.env.SMTP_FROM || `"Klyra" <${process.env.SMTP_USER}>`;

        const info = await transporter.sendMail({
            from,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });

        console.log(`[EMAIL] Sent to ${to} via SMTP. ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[EMAIL ERROR] SMTP Send failed:`, error.message);
        return false;
    }
};

/**
 * Send email using Resend API (Direct REST endpoint via native fetch)
 * Automatically falls back to SMTP if Resend fails due to sandbox (403) restrictions.
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM || 'Klyra <onboarding@resend.dev>';
        
        if (!apiKey) {
            console.log('ℹ️ [EMAIL SERVICE] RESEND_API_KEY is not defined. Falling back to SMTP or logging.');
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                return await sendEmailViaSmtp({ to, subject, html });
            }
            console.log(`\n================= [EMAIL DEV LOG] =================`);
            console.log(`To:      ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`HTML Preview:\n${html}`);
            console.log(`===================================================\n`);
            return true;
        }

        let response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
            }),
        });

        let data = await response.json();
        
        // Handle sandbox validation error by falling back to SMTP to send to original recipient, or redirecting if SMTP is not configured
        if (!response.ok && response.status === 403 && data.message && data.message.includes('You can only send testing emails to your own email address')) {
            console.log(`⚠️ [EMAIL SERVICE] Resend Sandbox restriction detected for [${to}].`);
            
            // Check if SMTP is configured to send to original recipient
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                console.log(`🔄 [EMAIL SERVICE] SMTP configuration found. Falling back to Gmail SMTP to send email directly to ${to}...`);
                const smtpSent = await sendEmailViaSmtp({ to, subject, html });
                if (smtpSent) {
                    return true;
                }
            }
            
            // If SMTP is not configured or fails, fallback to redirecting to verified owner
            const ownerMatch = data.message.match(/\(([^)]+)\)/);
            const sandboxOwnerEmail = ownerMatch ? ownerMatch[1] : 'rahulkumarsharma776194@gmail.com';
            
            console.log(`⚠️ [EMAIL SERVICE] SMTP fallback not available. Redirecting email from [${to}] to verified sandbox owner [${sandboxOwnerEmail}]`);
            
            const originalTo = Array.isArray(to) ? to.join(', ') : to;
            const redirectedSubject = `[Sandbox to: ${originalTo}] ${subject}`;
            
            const retryResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from,
                    to: [sandboxOwnerEmail],
                    subject: redirectedSubject,
                    html,
                }),
            });
            
            const retryData = await retryResponse.json();
            if (retryResponse.ok) {
                console.log(`[EMAIL] Redirected email successfully sent to sandbox owner ${sandboxOwnerEmail}. ID: ${retryData?.id || 'unknown'}`);
                return true;
            } else {
                console.error(`[EMAIL ERROR] Redirected email send also failed:`, retryData);
                data = retryData; // Update error details for fallback logger
            }
        }

        if (response.ok) {
            console.log(`[EMAIL] Sent to ${to} via Resend REST API. ID: ${data?.id || 'unknown'}`);
            return true;
        } else {
            console.error(`[EMAIL ERROR] Resend API returned error:`, data);
            // Fallback: log email in console for development visibility
            console.log(`\n================= [EMAIL FALLBACK LOG] =================`);
            console.log(`To:      ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Error:   ${JSON.stringify(data)}`);
            console.log(`HTML Preview:\n${html}`);
            console.log(`========================================================\n`);
            return false;
        }
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send via Resend API:`, error.message);
        return false;
    }
};

/**
 * Helper to get dynamic template, replace placeholders, and send email
 */
export const sendTemplateEmail = async (to, templateName, variablesMap = {}) => {
    try {
        const template = await EmailTemplate.findOne({ name: templateName });
        if (!template) {
            console.warn(`[EMAIL WARNING] Template '${templateName}' not found in database.`);
            return false;
        }

        let subject = template.subject;
        let htmlBody = template.htmlBody;

        // Replace placeholders (e.g. {userName} -> Rahul)
        Object.entries(variablesMap).forEach(([key, val]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            subject = subject.replace(regex, String(val));
            htmlBody = htmlBody.replace(regex, String(val));
        });

        return await sendEmail({ to, subject, html: htmlBody });
    } catch (error) {
        console.error(`[EMAIL ERROR] Template send failed for '${templateName}':`, error);
        return false;
    }
};

/**
 * Public notification triggers
 */
export const sendWelcomeEmail = async (to, userName) => {
    return sendTemplateEmail(to, 'welcome', { userName });
};

export const sendOrderConfirmationEmail = async (to, userName, orderId, totalAmount) => {
    return sendTemplateEmail(to, 'order_confirmation', { userName, orderId, totalAmount: totalAmount.toLocaleString('en-IN') });
};

export const sendOrderCancellationEmail = async (to, userName, orderId) => {
    return sendTemplateEmail(to, 'order_cancellation', { userName, orderId });
};

// Also keep the existing export for legacy compatibility
export const sendLoyaltyCouponEmail = async (to, userName, couponCode, discountValue, discountType, expiryDate) => {
    const discountText = discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`;
    const expiryText = new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // We can just call sendEmail with the HTML formatted in-service for loyalty
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

    return sendEmail({
        to,
        subject: `🎁 Exclusive ${discountText} OFF — Your Klyra Loyalty Reward!`,
        html
    });
};