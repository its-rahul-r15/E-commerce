import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        unique: true,
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Email subject is required'],
        trim: true
    },
    htmlBody: {
        type: String,
        required: [true, 'Email HTML body is required']
    },
    variables: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
export default EmailTemplate;
