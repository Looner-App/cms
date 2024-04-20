import { kebabCase } from 'lodash';
import { Button } from 'payload/components/elements';
import { useFormFields } from 'payload/components/forms';
import qr from 'qrcode';
import React from 'react';

export const QrCode = () => {
  const uniqueLink = useFormFields(([fields]) => fields.uniqueLink);
  const title = useFormFields(([fields]) => fields.title);
  const [qrData, setQrData] = React.useState(``);

  React.useEffect(() => {
    if (!uniqueLink.value) return;

    const getQR = async () => {
      return await qr.toDataURL(uniqueLink.value as string);
    };

    getQR().then((e: string) => {
      setQrData(e);
    });
  }, []);

  const downloadFile = (fileName: string, data: any, fileFormat: string): void => {
    const linkSource = `data:` + fileFormat + `;base64` + data;
    const downloadLink = document.createElement(`a`);
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  return (
    <div className="field-type ui">
      {uniqueLink.value && <img alt={`${uniqueLink.value}`} src={qrData} />}
      <Button
        buttonStyle="none"
        onClick={e => {
          e.preventDefault();
          downloadFile(`qrcode-${kebabCase(title.value as string)}`, qrData, `image/png`);
        }}
        type="button"
      >
        Download
      </Button>
    </div>
  );
};
