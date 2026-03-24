const groupByCustomer = (bills: Bill[]) => {
  const result: OrganizedRoute = {};
  bills.forEach((bill: Bill) => {
    const customerId = bill.customer ?? 0;
    const customerName = bill?.customer_details?.name ?? "Clients divers";
    if (!result[customerId]) {
      result[customerId] = {
        customer_name: customerName,
        total_amount: 0,
        total_package: 0,
        total_package_recorded: 0,
        total_products: {},
      };
    }

    result[customerId].total_amount += bill.total_amount;

    bill.product_bills.forEach((productBill) => {
      const productId = productBill.product;
      const productName = productBill.product_details.product_code;
      const quantity = productBill.quantity;

      if (!result[customerId].total_products[productId]) {
        result[customerId].total_products[productId] = {
          product_name: productName,
          total_quantity: 0,
        };
      }
      if (productBill.package_product_bill) {
        result[customerId].total_package +=
          productBill.package_product_bill.quantity;
        result[customerId].total_package_recorded +=
          productBill.package_product_bill.record;
      }

      result[customerId].total_products[productId].total_quantity += quantity;
    });
  });

  return result;
};

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (groupedData: GroupedData, fileName: string) => {
  // Create an array for Excel rows
  const rows: Array<{ [key: string]: any }> = [];

  // Iterate through the grouped data
  Object.entries(groupedData).forEach(([customerId, customerData]) => {
    // Add a row for the customer
    rows.push({
      Customer: customerData.customer_name,
      "Total Amount": customerData.total_amount,
      "Total Packages": customerData.total_package,
      "Total Packages Recorded": customerData.total_package_recorded,
    });

    // Add rows for each product purchased by the customer
    Object.entries(customerData.total_products).forEach(
      ([productId, productData]) => {
        rows.push({
          Product: productData.product_name,
          "Total Quantity": productData.total_quantity,
        });
      }
    );

    // Add an empty row for separation
    rows.push({});
  });

  // Create a worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Convert to a Blob and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(dataBlob, `${fileName}.xlsx`);
};

export default exportToExcel;

export { groupByCustomer, exportToExcel };
