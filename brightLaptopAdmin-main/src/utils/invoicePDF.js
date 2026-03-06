/**
 * Invoice PDF Generation Utility
 * Generates PDF invoices using jsPDF
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate and download invoice as PDF
 * @param {Object} invoiceData - Invoice data from API
 */
export const generateInvoicePDF = (invoiceData) => {
  const { invoice, order } = invoiceData;

  // Create new PDF document
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Invoice ${invoice.invoiceNumber}`,
    subject: `Invoice for Order ${order._id}`,
    author: "Bright Laptop",
    creator: "Bright Laptop E-commerce",
  });

  // Company Information (Header)
  doc.setFontSize(24);
  doc.setTextColor(31, 81, 255); // Blue color
  doc.setFont("helvetica", "bold");
  doc.text("Bright Laptop", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("Your Trusted Laptop Partner", 14, 27);

  // Company Address (Right aligned)
  doc.setFontSize(9);
  doc.text("NO 5 AND 6, KRISHNAPPA COMPOUND,", 130, 20);
  doc.text("JARAGANAHALLY, J P NAGAR 7TH PHASE,", 130, 26);
  doc.text("KANAKAPURA MAIN ROAD,", 130, 32);
  doc.text("Bengaluru (Bangalore) Urban,", 130, 38);
  doc.text("Karnataka, 560078", 130, 44);
  doc.text("Phone: +91 98450 44638", 130, 50);
  doc.text("Email: btxinwardoutward@gmail.com", 130, 56);

  // Invoice Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 14, 55);

  // Invoice Number and Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 63);
  doc.text(`Invoice Date: ${invoice.invoiceDate}`, 14, 69);
  doc.text(`Order Number: ${invoice.orderNumber}`, 14, 75);
  doc.text(`Order Date: ${invoice.orderDate}`, 14, 81);

  // Customer Information
  let yPos = 55;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 130, yPos);

  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customer.name || "Customer", 130, yPos);
  if (invoice.customer.email) {
    yPos += 5;
    doc.text(`Email: ${invoice.customer.email}`, 130, yPos);
  }
  if (invoice.customer.phone) {
    yPos += 5;
    doc.text(`Phone: ${invoice.customer.phone}`, 130, yPos);
  }
  if (invoice.customer.address) {
    yPos += 5;
    doc.text(invoice.customer.address.addressLine1 || "", 130, yPos);
    if (invoice.customer.address.addressLine2) {
      yPos += 5;
      doc.text(invoice.customer.address.addressLine2, 130, yPos);
    }
    yPos += 5;
    doc.text(
      `${invoice.customer.address.city || ""}, ${invoice.customer.address.state || ""} ${invoice.customer.address.postalCode || ""}`,
      130,
      yPos,
    );
    if (invoice.customer.address.country) {
      yPos += 5;
      doc.text(invoice.customer.address.country, 130, yPos);
    }
  }

  // B2B Buyer Company Information
  if (order.orderType === "B2B") {
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Company Details:", 130, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    // Company name and GST would come from user data
  }

  // Draw line separator
  doc.setLineWidth(0.5);
  doc.line(14, yPos + 5, 196, yPos + 5);

  // Product Items Table
  const tableStartY = yPos + 12;

  const tableData = invoice.items.map((item) => [
    item.srNo,
    item.description,
    item.warranty || "-",
    item.quantity.toString(),
    `Rs. ${item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    `Rs. ${item.lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
  ]);

  // Use autoTable function directly
  if (typeof autoTable !== "function") {
    throw new Error(
      "autoTable function not available. Please check jspdf-autotable installation.",
    );
  }

  autoTable(doc, {
    startY: tableStartY,
    head: [["Sr No", "Product Name", "Warranty", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [31, 81, 255],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 75, halign: "left" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 35, halign: "right" },
      5: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 14, right: 14 },
    styles: {
      overflow: "linebreak",
      cellPadding: 3,
    },
    didParseCell: function (data) {
      if (data.column.index === 1) {
        data.cell.styles.cellWidth = 75;
      }
    },
  });

  // Get the final Y position after table
  const finalY =
    doc.lastAutoTable && doc.lastAutoTable.finalY
      ? doc.lastAutoTable.finalY + 10
      : tableStartY + tableData.length * 8 + 20;

  // Pricing Summary - Right aligned section
  const pageWidth = doc.internal.pageSize.width;
  const rightMargin = pageWidth - 14;
  const summaryStartX = rightMargin - 60;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let summaryY = finalY;

  // Subtotal
  doc.text("Subtotal:", summaryStartX, summaryY);
  const subtotalText = `Rs. ${invoice.pricing.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  doc.text(subtotalText, rightMargin, summaryY, { align: "right" });

  summaryY += 6;
  // GST
  doc.text(`GST (${invoice.pricing.gstPercentage}%):`, summaryStartX, summaryY);
  const gstText = `Rs. ${invoice.pricing.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  doc.text(gstText, rightMargin, summaryY, { align: "right" });

  summaryY += 6;
  // Shipping
  doc.text("Shipping:", summaryStartX, summaryY);
  doc.text("FREE", rightMargin, summaryY, { align: "right" });

  // Draw separator line
  summaryY += 4;
  doc.setLineWidth(0.3);
  doc.line(summaryStartX, summaryY, rightMargin, summaryY);

  summaryY += 8;
  // Total Amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Amount:", summaryStartX, summaryY);
  const totalText = `Rs. ${invoice.pricing.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  doc.text(totalText, rightMargin, summaryY, { align: "right" });

  // Payment Information
  summaryY += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Method: ${invoice.paymentMethod}`, 14, summaryY);
  summaryY += 6;
  doc.text(`Payment Status: ${invoice.paymentStatus}`, 14, summaryY);
  summaryY += 6;
  doc.text(`Order Type: ${invoice.orderType}`, 14, summaryY);

  // Terms and Conditions
  summaryY += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Terms & Conditions:", 14, summaryY);

  summaryY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "1. Goods once sold will not be taken back or exchanged.",
    14,
    summaryY,
  );
  summaryY += 5;
  doc.text("2. Subject to Bangalore jurisdiction only.", 14, summaryY);
  summaryY += 5;
  doc.text(
    "3. Warranty terms and conditions apply as per manufacturer guidelines.",
    14,
    summaryY,
  );
  summaryY += 5;
  doc.text(
    "4. Invoice generated is computer-generated and does not require signature.",
    14,
    summaryY,
  );

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Thank you for your business!",
    doc.internal.pageSize.width / 2,
    pageHeight - 20,
    { align: "center" },
  );
  doc.text(
    "This is a computer-generated invoice.",
    doc.internal.pageSize.width / 2,
    pageHeight - 15,
    { align: "center" },
  );

  // Generate filename
  const filename = `Invoice_${invoice.invoiceNumber}_${invoice.orderNumber}.pdf`;

  // Save the PDF
  doc.save(filename);
};
