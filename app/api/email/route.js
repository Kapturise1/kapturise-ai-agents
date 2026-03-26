import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { gmailEmail, gmailPass, to, subject, body, fromName, replyTo } = await req.json();
    
    if (!gmailEmail || !gmailPass) {
      return Response.json({ error: "Gmail credentials not configured. Go to Integrations and add your Gmail email + App Password." }, { status: 400 });
    }
    if (!to || !subject || !body) {
      return Response.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailEmail, pass: gmailPass }
    });

    const mailOptions = {
      from: fromName ? `"${fromName} - Kapturise" <${replyTo || gmailEmail}>` : gmailEmail,
      replyTo: replyTo || gmailEmail,
      to: to,
      subject: subject,
      html: body.replace(/\n/g, "<br>")
    };

    const info = await transporter.sendMail(mailOptions);
    return Response.json({ success: true, messageId: info.messageId });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}