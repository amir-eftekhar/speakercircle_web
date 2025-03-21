import { Recipient, EmailParams, MailerSend } from 'mailersend';
import { CONTACT_INFO, COMPANY_INFO } from './constants';

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

type SendEmailParams = {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
}: SendEmailParams) {
  try {
    const recipients = [new Recipient(to, toName)];

    const emailParams = new EmailParams()
      .setFrom(CONTACT_INFO.email)
      .setFromName(COMPANY_INFO.name)
      .setRecipients(recipients)
      .setSubject(subject)
      .setHtml(html)
      .setText(text);

    await mailersend.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome to ${COMPANY_INFO.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to ${COMPANY_INFO.name}, ${name}!</h1>
        <p>${COMPANY_INFO.description}</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Browse upcoming events</li>
          <li>Register for a workshop</li>
        </ul>
        <p>If you have any questions, feel free to contact us:</p>
        <ul>
          <li>Email: ${CONTACT_INFO.email}</li>
          <li>Phone: ${CONTACT_INFO.phone}</li>
        </ul>
        <p>Best regards,<br>The ${COMPANY_INFO.name} Team</p>
      </div>
    `,
    text: `
Welcome to ${COMPANY_INFO.name}, ${name}!

${COMPANY_INFO.description}

Here's what you can do next:
- Complete your profile
- Browse upcoming events
- Register for a workshop

If you have any questions, feel free to contact us:
Email: ${CONTACT_INFO.email}
Phone: ${CONTACT_INFO.phone}

Best regards,
The ${COMPANY_INFO.name} Team
    `,
  }),

  eventRegistration: (name: string, eventTitle: string, eventDate: string) => ({
    subject: `Registration Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Registration Confirmed!</h1>
        <p>Hello ${name},</p>
        <p>Your registration for <strong>${eventTitle}</strong> on ${eventDate} has been confirmed.</p>
        <p>We look forward to seeing you there!</p>
        <p>If you have any questions, please contact us:</p>
        <ul>
          <li>Email: ${CONTACT_INFO.email}</li>
          <li>Phone: ${CONTACT_INFO.phone}</li>
        </ul>
        <p>Best regards,<br>The ${COMPANY_INFO.name} Team</p>
      </div>
    `,
    text: `
Registration Confirmed!

Hello ${name},

Your registration for ${eventTitle} on ${eventDate} has been confirmed.
We look forward to seeing you there!

If you have any questions, please contact us:
Email: ${CONTACT_INFO.email}
Phone: ${CONTACT_INFO.phone}

Best regards,
The ${COMPANY_INFO.name} Team
    `,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>If you have any questions, please contact us:</p>
        <ul>
          <li>Email: ${CONTACT_INFO.email}</li>
          <li>Phone: ${CONTACT_INFO.phone}</li>
        </ul>
        <p>Best regards,<br>The ${COMPANY_INFO.name} Team</p>
      </div>
    `,
    text: `
Password Reset Request

Hello ${name},

We received a request to reset your password. Click the link below to set a new password:
${resetLink}

If you didn't request this, you can safely ignore this email.

If you have any questions, please contact us:
Email: ${CONTACT_INFO.email}
Phone: ${CONTACT_INFO.phone}

Best regards,
The ${COMPANY_INFO.name} Team
    `,
  }),
};
