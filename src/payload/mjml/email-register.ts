import { generateMJML } from './generate-mjml';

export const emailRegister = ({
  name,
  siteName,
  link,
}: {
  link: string;
  name: string;
  siteName: string;
}) => {
  return generateMJML({
    mjmlBody: `
    <mj-text mj-class="h1">Welcome to ${siteName}, ${name}!</mj-text>

    <mj-text>To view your account dashboard, click button below</mj-text>

    <mj-button mj-class="buttonStyle" href="${link}">View Account</mj-button>
    `,
  });
};
