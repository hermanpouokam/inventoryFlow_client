// pages/api/generate-pdf.js
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const stream = new PassThrough();
    doc.pipe(stream);

    // Add content to the PDF
    doc.text(content, {
      align: "left",
    });

    doc.end();

    // Set headers to download the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="document.pdf"');

    // Pipe the PDF to the response
    stream.pipe(res);
  } else {
    // Method Not Allowed
    res.setHeader("Allow", "POST");
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
