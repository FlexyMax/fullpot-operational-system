import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendVerificationCode(to: string, code: string, name: string) {
    await transporter.sendMail({
        from:    `"FullPot System" <${process.env.EMAIL_FROM}>`,
        to,
        subject: "Your Access Code — FullPot Operational System",
        html: `
<div style="font-family:'JetBrains Mono',monospace;max-width:480px;margin:0 auto;background:#151313;color:#e8e1e0;padding:32px;border-radius:8px;border:1px solid rgba(251,117,6,0.3);">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="font-size:28px;font-weight:900;color:#FB7506;">Flexy</span><span style="font-size:28px;font-weight:900;color:#e8e1e0;">Max</span>
  </div>
  <p style="color:#a78b7c;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Hello, ${name}</p>
  <p style="color:#e8e1e0;font-size:14px;margin:0 0 20px;">Your verification code for the FullPot Operational System:</p>
  <div style="text-align:center;padding:20px;background:rgba(251,117,6,0.1);border:1px solid rgba(251,117,6,0.3);border-radius:6px;margin-bottom:20px;">
    <span style="font-size:38px;font-weight:900;color:#FB7506;letter-spacing:0.35em;">${code}</span>
  </div>
  <p style="color:#584236;font-size:11px;text-align:center;margin:0;">This code expires in 10 minutes. Do not share it with anyone.</p>
</div>`,
    });
}
