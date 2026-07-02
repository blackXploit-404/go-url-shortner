import QRCodeStyling from 'qr-code-styling'

const centerLogo = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="18" fill="#ffffff"/>
  <rect x="3" y="3" width="58" height="58" rx="16" fill="none" stroke="#18181b" stroke-width="2"/>
  <path
    d="M24 34c0-5.523 4.477-10 10-10h6v6h-6a4 4 0 0 0-4 4v2h10v6H24v-8Z"
    fill="#18181b"
  />
  <path
    d="M40 30c0 5.523-4.477 10-10 10h-6v-6h6a4 4 0 0 0 4-4v-2H24v-6h16v8Z"
    fill="#52525b"
  />
</svg>
`)}`

function createStyledQr(data) {
  return new QRCodeStyling({
    width: 280,
    height: 280,
    type: 'canvas',
    data,
    margin: 6,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'H',
    },
    dotsOptions: {
      type: 'rounded',
      gradient: {
        type: 'linear',
        rotation: 135,
        colorStops: [
          { offset: 0, color: '#09090b' },
          { offset: 0.55, color: '#27272a' },
          { offset: 1, color: '#52525b' },
        ],
      },
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
      gradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: '#09090b' },
          { offset: 1, color: '#3f3f46' },
        ],
      },
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#18181b',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    image: centerLogo,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.34,
      margin: 4,
      crossOrigin: 'anonymous',
    },
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function generateStyledQrDataUrl(data) {
  const qrCode = createStyledQr(data)
  const blob = await qrCode.getRawData('png')

  if (!blob) {
    throw new Error('Could not generate QR code.')
  }

  return blobToDataUrl(blob)
}

export async function downloadStyledQr(data, filename) {
  const qrCode = createStyledQr(data)
  await qrCode.download({
    name: filename.replace(/\.png$/, ''),
    extension: 'png',
  })
}
