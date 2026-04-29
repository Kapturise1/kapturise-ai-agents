// Temporary test endpoint — sends a sample event coverage email
import nodemailer from 'nodemailer';
import { EMAIL_TEMPLATES, renderTemplate } from '@/lib/emailTemplates';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to') || 'habeeb@kapturise.com';

  const pass = process.env.GMAIL_APP_PASSWORD;
  const user = process.env.GMAIL_EMAIL || 'contact@kapturise.com';
  if (!pass) return Response.json({ error: 'No GMAIL_APP_PASSWORD' }, { status: 500 });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const template = EMAIL_TEMPLATES.events;
  const { subject, body } = renderTemplate(template, {
    contactName: 'Event Manager',
    company: 'Your Company',
    agentName: 'Kapturise Team',
    agentTitle: 'Sales',
  });

  try {
    const info = await transporter.sendMail({
      from: `"Kapturise" <${user}>`,
      to,
      subject,
      html: body,
    });
    return Response.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
