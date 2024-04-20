import { generateMJML } from './generate-mjml';

export const emailForgotPassword = ({ name, link }: { link: string; name: string }) => {
  return generateMJML({
    mjmlBody: `
    <mj-text mj-class="h1">Hello ${name}!</mj-text>

    <mj-text>You are receiving this because you (or someone else) have requested the reset of the password for your account.</mj-text>

    <mj-text>Please click the button below to reset your password.</mj-text>

    <mj-button mj-class="buttonStyle" href="${link}">Reset Password</mj-button>

    <mj-text>If you did not request this, please ignore this email and your password will remain unchanged.</mj-text>
    `,
  });
};
