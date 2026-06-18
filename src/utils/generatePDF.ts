// src/utils/generatePdf.js
import { PDFDocument, rgb } from "pdf-lib";

export const generatePdf = async (htmlContent) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Basic example: Draw text content on PDF
    page.drawText(htmlContent, {
      x: 50,
      y: height,
      size: 12,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("Error in generatePdf function:", error);
    throw error;
  }
};
