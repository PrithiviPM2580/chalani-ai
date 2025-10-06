// nodemailerTemplate.ts
import config from '@/config/envValidation';

export function nodemailerTemplateForForgotPassword(
  email: string,
  username?: string,
  passwordResetToken?: string
) {
  const resetLink = `${config.CLIENT_URL}/reset-password?token=${passwordResetToken}`;

  return {
    from: `Chalani AI <${config.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    text: `Hi ${username},\n\nYou requested a password reset. Use the link below:\n${resetLink}\n\nThis link will expire in 15 minutes. If you did not request this, please ignore this email.\n\nThanks,\nThe Chalani AI Team`,
    html: `
      <p>Hi ${username},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p style="text-align:center;">
        <a href="${resetLink}" 
           style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:#fff;
                  text-decoration:none;border-radius:5px;font-weight:bold;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in <strong>15 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p style="font-size:12px;color:#888;">Never share your password or reset link with anyone.</p>
      <p>Thanks,<br/>The Chalani AI Team</p>
    `,
  };
}

export function nodemailerTemplateForResetPassword(
  email: string,
  username?: string
) {
  return {
    from: `Chalani AI <${config.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Successful',
    text: `Hi ${username},\n\nYour password has been successfully reset. If you did not perform this action, please contact our support team immediately.\n\nThanks,\nThe Chalani AI Team`,
    html: `
      <p>Hi ${username},</p>
      <p>Your password has been <strong>successfully reset</strong>.</p>
      <p>If you did <strong>not</strong> perform this action, please secure your account immediately by contacting our support team.</p>
      
      <p style="margin-top:20px;font-size:12px;color:#888;">
        For your security, we recommend enabling 2FA and never sharing your password with anyone.
      </p>
      
      <p>Thanks,<br/>The Chalani AI Team</p>
    `,
  };
}
