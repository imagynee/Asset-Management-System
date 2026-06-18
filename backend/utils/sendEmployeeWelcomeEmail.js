const nodemailer = require('nodemailer');

const requiredMailEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

const getTransporter = () => {
    const missingKeys = requiredMailEnv.filter((key) => !process.env[key]);

    if (missingKeys.length > 0) {
        throw new Error(`Missing email environment variables: ${missingKeys.join(', ')}`);
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendEmployeeWelcomeEmail = async ({ employee, temporaryPassword }) => {
    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: employee.email,
        subject: 'Your AMS employee account has been created',
        text: [
            `Hello ${employee.name},`,
            '',
            'Your employee account has been created successfully.',
            '',
            `Employee Name: ${employee.name}`,
            `Employee ID: ${employee.empId}`,
            `Login Email: ${employee.email}`,
            `Temporary Password: ${temporaryPassword}`,
            '',
            'Please log in and change your temporary password immediately.'
        ].join('\n')
    });
};

module.exports = sendEmployeeWelcomeEmail;


// Admin creates employee
//         ↓
// Employee saved in MongoDB
//         ↓
// sendEmployeeWelcomeEmail()
//         ↓
// getTransporter() --- JOB 1 of sendEmployeeWelcomeEmail()
//         ↓
// Connect to Gmail/SMTP
//         ↓
// sendMail()       --- JOB 2 of sendEmployeeWelcomeEmail()
//         ↓
// Employee receives credentials