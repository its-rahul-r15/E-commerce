import EmailTemplate from '../models/EmailTemplate.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * Get all email templates
 * GET /api/admin/emails/templates
 */
export const getTemplates = async (req, res, next) => {
    try {
        const templates = await EmailTemplate.find().sort({ name: 1 });
        return successResponse(res, templates, 'Email templates retrieved successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Update an email template
 * PUT /api/admin/emails/templates/:name
 */
export const updateTemplate = async (req, res, next) => {
    try {
        const { name } = req.params;
        const { subject, htmlBody } = req.body;

        const template = await EmailTemplate.findOne({ name });
        if (!template) {
            return errorResponse(res, 'Template not found', 404, 'TEMPLATE_NOT_FOUND');
        }

        if (subject) template.subject = subject;
        if (htmlBody) template.htmlBody = htmlBody;

        await template.save();

        return successResponse(res, template, 'Email template updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Send customized broadcast email to all customers
 * POST /api/admin/emails/broadcast
 */
export const sendBroadcast = async (req, res, next) => {
    try {
        const { subject, htmlBody, userIds, emails } = req.body;

        if (!subject || !htmlBody) {
            return errorResponse(res, 'Subject and HTML body are required', 400, 'INVALID_INPUT');
        }

        // Fetch customer emails
        let query = { role: 'customer' };
        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            query._id = { $in: userIds };
        } else if (emails && Array.isArray(emails) && emails.length > 0) {
            query.email = { $in: emails };
        }

        const customers = await User.find(query).select('email name');

        if (customers.length === 0) {
            return successResponse(res, { count: 0 }, 'No customers found for email campaign');
        }

        // Send emails in background to avoid blocking response
        let successCount = 0;
        let failCount = 0;

        // Run non-blocking sending task
        const sendPromises = customers.map(async (customer) => {
            let personalizedHtml = htmlBody;
            let personalizedSubject = subject;

            // Replace placeholders
            personalizedHtml = personalizedHtml.replace(/{userName}/g, customer.name);
            personalizedSubject = personalizedSubject.replace(/{userName}/g, customer.name);

            try {
                const sent = await sendEmail({
                    to: customer.email,
                    subject: personalizedSubject,
                    html: personalizedHtml
                });
                if (sent) successCount++;
                else failCount++;
            } catch (e) {
                failCount++;
                console.error(`Email failed for ${customer.email}:`, e);
            }
        });

        // Wait for all sends to resolve (they run concurrently)
        await Promise.all(sendPromises);

        return successResponse(
            res, 
            { total: customers.length, success: successCount, failed: failCount }, 
            `Email campaign complete. Sent: ${successCount}, Failed: ${failCount}`
        );
    } catch (error) {
        next(error);
    }
};
