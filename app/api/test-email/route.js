// Temporary test endpoint — sends a sample event coverage email
import nodemailer from 'nodemailer';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

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

  const html = EMAIL_TEMPLATES.events(to === 'habeeb@kapturise.com' ? 'Kapturise Team' : 'Valued Client', 'Event Manager');

  try {
    const info = await transporter.sendMail({
      from: `"Kapturise" <${user}>`,
      to,
      subject: '🎬 Event Coverage & AI Video Production — Kapturise',
      html,
    });
    return Response.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
