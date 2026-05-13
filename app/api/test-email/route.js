import { getTemplateForIndustry, renderTemplate } from '../../../lib/emailTemplates';
import nodemailer from 'nodemailer';

export async function GET(request) {
    try {
          const { searchParams } = new URL(request.url);
          const to = searchParams.get('to') || 'eng_ops@kapturise.com';
          const industry = searchParams.get('industry') || 'general';

      // Get and render template
      const template = getTemplateForIndustry(industry);
          const rendered = renderTemplate(template, {
                  contactName: 'Test User',
                  company: 'Test Company LLC',
                  agentName: 'Sara Khan',
                  agentTitle: 'Business Development',
          });

      const subject = '[TEST] ' + rendered.subject;
          const body = rendered.body;

      // Send via Gmail
      const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                        user: process.env.GMAIL_EMAIL,
                        pass: process.env.GMAIL_APP_PASSWORD,
              },
      });

      const info = await transporter.sendMail({
              from: `Kapturise <${process.env.GMAIL_EMAIL}>`,
              to,
              subject,
              html: body,
      });

      return Response.json({
              ok: true,
              message: `Test email sent to ${to}`,
              industry,
              templateName: template.name,
              messageId: info.messageId,
      });
    } catch (err) {
          return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
}
