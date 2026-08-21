import "server-only";

type EmailMessage = {
  to: string;
  subject: string;
  body: string;
};

/**
 * No transactional email provider is wired up yet. In development we log the
 * message (and the caller surfaces the link on-screen) so the verification
 * and password-reset flows are fully testable end-to-end. Swap this out for
 * a real provider (Resend, SendGrid, etc.) before launch — every call site
 * goes through this one function.
 */
async function send(message: EmailMessage) {
  console.log(
    `\n--- WorkBridge email (dev mode, no provider configured) ---\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.body}\n---\n`
  );
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  await send({
    to,
    subject: "Verify your WorkBridge email",
    body: `Welcome to WorkBridge. Verify your email address:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send({
    to,
    subject: "Reset your WorkBridge password",
    body: `We received a request to reset your WorkBridge password:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email. This link expires in 1 hour.`,
  });
}
