import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { gmailEmail, gmailPass, to, subject, body, fromName, replyTo } = await req.json();
    const em = process.env.GMAIL_EMAIL || gmailEmail;
    const pw = process.env.GMAIL_APP_PASSWORD || gmailPass;
    if (!em || !pw) return Response.json({ error: "Gmail credentials not configured. Set GMAIL_EMAIL and GMAIL_APP_PASSWORD env vars, or provide in request." }, { status: 400 });
    if (!to || !subject || !body) return Response.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: em, pass: pw } });
    const mailOptions = {
      from: fromName ? '"' + fromName + ' - Kapturise" <' + (replyTo || em) + '>' : em,
      replyTo: replyTo || em, to, subject,
      html: body.replace(/\n/g, "<br>")
    };
    const info = await transporter.sendMail(mailOptions);
    return Response.json({ success: true, messageId: info.messageId });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
