import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuration
const CONFIG = {
  FROM_EMAIL: process.env.CONTACT_FROM_EMAIL || 'seniors@vragc.co.uk',
  TO_EMAIL: process.env.CONTACT_TO_EMAIL || 'seniors@vragc.co.uk',
  REPLY_TO_EMAIL: process.env.CONTACT_REPLY_TO_EMAIL || 'seniors@vragc.co.uk',
};

export async function POST({ request }) {
  try {
    // Parse form data
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const subject = formData.get('subject')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message is too long. Please keep it under 5000 characters.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Map subject values to readable text
    const subjectMap = {
      'general': 'General Inquiry',
      'membership': 'Membership Information',
      'competitions': 'Competitions & Events',
      'matches': 'Inter-club Matches',
      'hall-of-fame': 'Hall of Fame',
      'technical': 'Website Technical Issue',
      'other': 'Other'
    };

    const readableSubject = subjectMap[subject] || subject;
    const emailSubject = `Contact Form: ${readableSubject} - ${name}`;

    // Create email content
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #0d9488); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 14px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #d1d5db; }
          .message-content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Vale Royal Abbey Golf Club Seniors</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${escapeHtml(name)}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${escapeHtml(email)}</div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${escapeHtml(readableSubject)}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value message-content">${escapeHtml(message)}</div>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">This message was sent via the contact form on the VRA Seniors website.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Submitted on ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
New Contact Form Submission - Vale Royal Abbey Golf Club Seniors

Name: ${name}
Email: ${email}
Subject: ${readableSubject}

Message:
${message}

---
This message was sent via the contact form on the VRA Seniors website.
Submitted on ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
    `;

    // Prepare SES email parameters
    const emailParams = {
      Source: CONFIG.FROM_EMAIL,
      Destination: {
        ToAddresses: [CONFIG.TO_EMAIL],
      },
      ReplyToAddresses: [email], // Allow direct reply to the sender
      Message: {
        Subject: {
          Data: emailSubject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8',
          },
        },
      },
    };

    // Send email via SES
    const command = new SendEmailCommand(emailParams);
    const result = await sesClient.send(command);

    console.log('Email sent successfully:', result.MessageId);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Your message has been sent successfully!',
        messageId: result.MessageId
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);

    // Handle specific AWS SES errors
    let errorMessage = 'An error occurred while sending your message. Please try again later.';
    
    if (error.name === 'MessageRejected') {
      errorMessage = 'Message was rejected. Please check your email address and try again.';
    } else if (error.name === 'MailFromDomainNotVerifiedException') {
      errorMessage = 'Email service configuration error. Please contact the administrator.';
    } else if (error.name === 'ConfigurationSetDoesNotExistException') {
      errorMessage = 'Email service configuration error. Please contact the administrator.';
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Handle unsupported methods
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function PUT() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function DELETE() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}