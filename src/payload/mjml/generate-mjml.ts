import mjml from 'mjml';

export const attributes = () => {
  return `
  <mj-all font-family="Helvetica, Arial" font-size="14px" color="white" line-height="1.5rem" />
  <mj-class name="accentColor" color="#f7941f" />
  <mj-class name="primaryTextColor" color="#ffffff" />
  <mj-class name="secondaryTextColor" color="#ffffff" />
  <mj-class name="borderAccentColor" border-color="white" />
  <mj-class name="small" font-size="12px" />
  <mj-class name="regular" font-size="14px" />
  <mj-class name="h1" font-size="1.4rem" font-weight="bold" padding-top="16px" />
  <mj-class name="h2" font-size="18px" font-weight="bold" />
  <mj-class name="topLogoStyle" width="125px" />
  <mj-class name="wrapperStyle" padding="50px 30px" border="0" />
  <mj-class name="mainSectionStyle" background-color="#18181B" border="1px solid secondaryColor" padding="1rem 0.5rem" />
  <mj-class name="footerTextStyle" font-size="10px" line-height="1.2rem" align="center" color="#7f7b93" />
  <mj-class name="buttonStyle" background-color="transparent" color="white" border="1px solid white" />
  `;
};

export const header = ({ logoUrl }: { logoUrl: string }) => {
  return `
    <mj-image mj-class="topLogoStyle" src="${logoUrl}" alt="${process.env.PAYLOAD_PUBLIC_SITE_NAME}"></mj-image>
    <mj-divider mj-class="borderAccentColor"></mj-divider>
    `;
};

export const footer = () => {
  return `
    <mj-section>
        <mj-column>
            <mj-text mj-class="footerTextStyle">This is an automatically generated e-mail, please do not reply. <br />Certain messages, like this one, are essential to service operations.</mj-text>
            <mj-text mj-class="footerTextStyle">${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}</mj-text>
        </mj-column>
    </mj-section>
    `;
};

export const generateMJML = ({ mjmlBody }: { mjmlBody: string }) => {
  return mjml(
    `
    <mjml>
        <mj-head>
            <mj-attributes>
            ${attributes()}
            </mj-attributes>
        </mj-head>
        <mj-body background-color="inherit">
            <mj-wrapper mj-class="wrapperStyle">
            <mj-section mj-class="primaryTextColor regular mainSectionStyle">
                <mj-column>

                ${header({
                  logoUrl: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/public/logo.png`,
                })}

                ${mjmlBody}

                </mj-column>
            </mj-section>
            ${footer()}
            </mj-wrapper>
        </mj-body>
    </mjml>
  `,
  ).html;
};
