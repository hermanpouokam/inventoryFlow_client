// components/PdfGenerator.js
import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

const PdfGenerator = () => {
  const contentRef = useRef();

  const generatePdf = () => {
    const element = contentRef.current;
    const opt = {
      margin: 1,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .outputPdf("blob")
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, "_blank");
      });
  };

  return (
    <div>
      <div ref={contentRef}>
        <h1>My HTML Content</h1>
        <p>This content will be converted to PDF.</p>
        {/* Add more HTML content as needed */}
      </div>
      <button onClick={generatePdf}>Generate PDF</button>
    </div>
  );
};

export default PdfGenerator;
s;
