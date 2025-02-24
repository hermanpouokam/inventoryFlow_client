// // lib/generatePdf.js
// import { PDFDocument, rgb } from 'pdf-lib';

// export async function createPdf() {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([600, 400]);
//   const { width, height } = page.getSize();
//   const fontSize = 30;

//   page.drawText('Hello, world!', {
//     x: 50,
//     y: height - 4 * fontSize,
//     size: fontSize,
//     color: rgb(0, 0.53, 0.71),
//   });

//   const pdfBytes = await pdfDoc.save();
//   return pdfBytes;
// }

// pages/api/pdf.js
// import { createPdf } from '../../lib/generatePdf';

// export default async function handler(req, res) {
//   const pdfBytes = await createPdf();

//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename=example.pdf');
//   res.status(200).send(pdfBytes);
// }

// pages/download.js
// import React from 'react';

// const Download = () => {
//   const handleDownload = () => {
//     fetch('/api/pdf')
//       .then((response) => response.blob())
//       .then((blob) => {
//         const url = window.URL.createObjectURL(new Blob([blob]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', 'example.pdf');
//         document.body.appendChild(link);
//         link.click();
//         link.parentNode.removeChild(link);
//       });
//   };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <button
//         onClick={handleDownload}
//         className="px-4 py-2 bg-blue-500 text-white rounded"
//       >
//         Download PDF
//       </button>
//     </div>
//   );
// };

// export default Download;
