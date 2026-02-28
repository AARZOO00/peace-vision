// ════════════════════════════════════
//   PEACE VISION — Email Configuration
//   Updated branding: Midnight + Teal + Rose Gold
// ════════════════════════════════════

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Base Email Template ───
function baseTemplate({ preheader = '', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Peace Vision</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:'Georgia',serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d2b35,#1a4a5c);padding:40px;text-align:center;border-radius:16px 16px 0 0;border:1px solid rgba(58,184,204,0.15);border-bottom:none;">
            <div style="font-size:24px;margin-bottom:8px;">✦</div>
            <h1 style="color:#f8f4ef;font-size:28px;margin:0 0 6px;font-weight:700;letter-spacing:-0.02em;">Peace Vision</h1>
            <p style="color:rgba(58,184,204,0.8);font-family:'Arial',sans-serif;font-size:11px;letter-spacing:4px;margin:0;text-transform:uppercase;">Heal · Align · Transform</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#0f1d28;padding:40px;border:1px solid rgba(58,184,204,0.1);border-top:none;border-bottom:none;">
            ${body}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#080f18;padding:24px 40px;text-align:center;border-radius:0 0 16px 16px;border:1px solid rgba(58,184,204,0.08);border-top:1px solid rgba(58,184,204,0.06);">
            <p style="color:rgba(248,244,239,0.25);font-family:'Arial',sans-serif;font-size:12px;margin:0 0 8px;">
              © ${new Date().getFullYear()} Peace Vision · 
              <a href="mailto:hello@peacevision.com" style="color:rgba(58,184,204,0.5);text-decoration:none;">hello@peacevision.com</a>
            </p>
            <p style="color:rgba(248,244,239,0.15);font-family:'Arial',sans-serif;font-size:11px;margin:0;">
              You're receiving this because you connected with Peace Vision.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Text helpers ───
const h2 = (text) => `<h2 style="color:#f8f4ef;font-size:22px;margin:0 0 16px;font-weight:400;">${text}</h2>`;
const p = (text) => `<p style="color:rgba(248,244,239,0.65);font-family:'Arial',sans-serif;font-size:15px;line-height:1.7;margin:0 0 16px;">${text}</p>`;
const em = (text) => `<em style="color:#e8b89a;font-style:italic;">${text}</em>`;
const btn = (href, text) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#d4956a,#e8b89a);color:#1a1f2e;font-family:'Arial',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:50px;">
      ${text}
    </a>
  </div>`;
const divider = () => `<hr style="border:none;border-top:1px solid rgba(58,184,204,0.1);margin:24px 0;" />`;
const quote = (text) => `<blockquote style="border-left:2px solid #d4956a;margin:20px 0;padding:12px 20px;color:rgba(248,244,239,0.5);font-style:italic;font-size:14px;">${text}</blockquote>`;
const sign = () => `
  ${divider()}
  <p style="color:rgba(248,244,239,0.4);font-family:'Arial',sans-serif;font-size:13px;margin:0;">With love and light,<br/>
  <strong style="color:rgba(58,184,204,0.8);">The Peace Vision Team</strong></p>`;

// ─── Admin Notification ───
async function sendAdminNotification({ subject, html }) {
  return transporter.sendMail({
    from: `Peace Vision <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[PV Admin] ${subject}`,
    html: baseTemplate({
      preheader: subject,
      body: `
        <div style="background:rgba(58,184,204,0.06);border:1px solid rgba(58,184,204,0.15);border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="color:rgba(58,184,204,0.8);font-family:'Arial',sans-serif;font-size:11px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">Admin Notification</p>
          <h2 style="color:#f8f4ef;font-size:20px;margin:0;">${subject}</h2>
        </div>
        ${html}
      `,
    }),
  });
}

// ─── Client Auto-Reply ───
async function sendClientReply({ to, name, subject, html }) {
  return transporter.sendMail({
    from: `Peace Vision <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html: baseTemplate({
      preheader: subject,
      body: `
        ${h2(`Dear ${name},`)}
        ${html}
        ${sign()}
      `,
    }),
  });
}

// ─── Pre-built Email Templates ───

function contactConfirmationEmail(name, service) {
  return `
    ${p(`Thank you for reaching out to Peace Vision. We have received your message and our team will be in touch within ${em('24 hours')}.`)}
    ${service ? `<p style="color:rgba(248,244,239,0.65);font-family:'Arial',sans-serif;font-size:15px;line-height:1.7;margin:0 0 16px;">You expressed interest in: <strong style="color:#e8b89a;">${service}</strong></p>` : ''}
    ${quote(`"Every healing journey begins with a single courageous step of reaching out."`)}
    ${p('While you wait, feel free to explore our blog for soul care practices, or take our AI Healing Quiz to discover which path is right for you.')}
    ${btn('https://peacevision.com/#quiz', 'Take the Healing Quiz →')}
  `;
}

function bookingConfirmationEmail(name, service, date, meetLink) {
  return `
    ${p(`Wonderful news — your session has been ${em('confirmed')}. We're looking forward to beginning this healing journey with you.`)}
    <table style="width:100%;background:rgba(58,184,204,0.05);border:1px solid rgba(58,184,204,0.15);border-radius:12px;padding:0;border-collapse:separate;border-spacing:0;margin:20px 0;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(58,184,204,0.08);">
        <span style="color:rgba(58,184,204,0.6);font-family:'Arial',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Service</span><br/>
        <strong style="color:#f8f4ef;font-size:16px;">${service}</strong>
      </td></tr>
      ${date ? `<tr><td style="padding:16px 20px;border-bottom:1px solid rgba(58,184,204,0.08);">
        <span style="color:rgba(58,184,204,0.6);font-family:'Arial',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Date & Time</span><br/>
        <strong style="color:#f8f4ef;font-size:16px;">${date}</strong>
      </td></tr>` : ''}
      ${meetLink ? `<tr><td style="padding:16px 20px;">
        <span style="color:rgba(58,184,204,0.6);font-family:'Arial',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Meeting Link</span><br/>
        <a href="${meetLink}" style="color:#d4956a;font-size:15px;">${meetLink}</a>
      </td></tr>` : ''}
    </table>
    ${p('Please find a quiet, comfortable space for your session. Have a glass of water nearby and give yourself a few minutes to settle before we begin.')}
    ${btn(meetLink || 'https://peacevision.com', meetLink ? 'Join Session →' : 'View Your Booking →')}
  `;
}

function welcomeEmail(name) {
  return `
    ${p(`Welcome to the Peace Vision family — we are so glad you're here, ${em(name)}.`)}
    ${p('Your account has been created. You now have access to your healing resources, session bookings, and our community circle.')}
    ${btn('https://peacevision.com/#contact', 'Book Your First Session →')}
    ${quote(`"Healing is not about becoming someone new. It is about returning to who you have always been."`)}
    ${p('Start by booking your complimentary Heart Connection Call — a free 30-minute session to understand your needs and map your unique healing path.')}
  `;
}

function newsletterWelcomeEmail(name) {
  return `
    ${p(`You're in! Thank you for joining the Peace Vision community.`)}
    ${p('Each week you\'ll receive soul care wisdom, healing practices, and gentle guidance for your journey — delivered with love to your inbox.')}
    ${btn('https://peacevision.com/blog.html', 'Read the Soul Journal →')}
    ${p('In the meantime, why not take our free AI Healing Quiz to discover which practice is most aligned with where you are right now?')}
    ${btn('https://peacevision.com/#quiz', 'Take the Healing Quiz →')}
  `;
}

module.exports = {
  transporter,
  sendAdminNotification,
  sendClientReply,
  contactConfirmationEmail,
  bookingConfirmationEmail,
  welcomeEmail,
  newsletterWelcomeEmail,
};