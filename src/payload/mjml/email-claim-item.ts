import { generateMJML } from './generate-mjml';

export const emailClaimItem = ({
  name,
  itemName,
  link,
}: {
  itemName: string;
  link: string;
  name: string;
}) => {
  return generateMJML({
    mjmlBody: `
    <mj-text mj-class="h1">Congrats ${name}!</mj-text>

    <mj-text>You got item ${itemName}.</mj-text>

    <mj-button mj-class="buttonStyle" href="${link}">View Your Items</mj-button>
    `,
  });
};
