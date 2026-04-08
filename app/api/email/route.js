import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request) {
  try {
    const { to, subject, body, provider, apiKey } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    if (provider === 'resend' && apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Kapturise <noreply@kapturise.com>',
          to: [to],
          subject,
          html: body,
        }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.message || 'Resend error' }, { status: res.status });
      return NextResponse.json({ success: true, id: data.id, provider: 'resend' });
    }

    if (provider === 'sendgrid' && apiKey) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@kapturise.com', name: 'Kapturise' },
          subject,
          content: [{ type: 'text/html', value: body }],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json({ error: data.errors?.[0]?.message || 'SendGrid error' }, { status: res.status });
      }
      return NextResponse.json({ success: true, provider: 'sendgrid' });
    }

    if (provider === 'mailgun' && apiKey) {
      const domain = 'kapturise.com';
      const formData = new URLSearchParams();
      formData.append('from', 'Kapturise <noreply@kapturise.com>');
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', body);
      const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.message || 'Mailgun error' }, { status: res.status });
      return NextResponse.json({ success: true, id: data.id, provider: 'mailgun' });
    }

    return NextResponse.json({ error: 'No email provider configured. Add a Resend, SendGrid, or Mailgun API key in Integrations.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
