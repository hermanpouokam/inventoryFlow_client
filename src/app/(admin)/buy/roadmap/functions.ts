import moment from "moment";
import { parse } from "json2csv";
import { unparse } from "papaparse";

function groupBySupplierAndCategory(data) {
  return data.reduce((acc, supply) => {
    const supplierName = supply.supplier_details.name;
    const categoryName =
      supply.supply_products[0].product_details.category_name;

    // Initialize the supplier entry if it doesn't exist
    if (!acc[supplierName]) {
      acc[supplierName] = {};
    }

    // Initialize the category entry if it doesn't exist
    if (!acc[supplierName][categoryName]) {
      acc[supplierName][categoryName] = {};
    }

    // Process each product in the supply
    supply.supply_products.forEach((product) => {
      const productName = product.product_details.name;
      const productCode = product.product_details.product_code;
      const productQuantity = product.quantity;

      // Initialize the product entry if it doesn't exist
      if (!acc[supplierName][categoryName][productName]) {
        acc[supplierName][categoryName][productName] = {
          code: productCode,
          quantity: 0,
        };
      }

      // Accumulate the quantity for the product
      acc[supplierName][categoryName][productName].quantity += productQuantity;
    });

    return acc;
  }, {});
}

// const generateCSV = ({ groupedData, title, salespoint }) => {
//   const csvData = [];

//   csvData.push([`${salespoint?.name ?? "N/A"}`]);
//   csvData.push(["Adresse", salespoint?.address ?? "N/A"]);
//   csvData.push(["Numéro", salespoint?.number ?? "N/A"]);
//   csvData.push(["Email", salespoint?.email ?? "N/A"]);
//   csvData.push([]);
//   csvData.push([title]);
//   csvData.push([]);

//   Object.entries(groupedData).forEach(([customerId, customerData]) => {
//     // csvData.push([`Client: ${customerData}`]);
//     csvData.push(["Product ID", "Product Name", "Total Quantity"]);

//     Object.entries(customerData).forEach(([catId, cat]) => {
//       csvData.push([catId]);
//       Object.entries(cat).forEach(([productId, product]) => {
//         csvData.push([product.code, productId, product.quantity]);
//       });
//     });

//     csvData.push([]);
//   });

//   csvData.push([`Generated on: ${moment().format("DD/MM/YYYY hh:mm:ss")}`]);
//   csvData.push(["© 2025 InventoryFlow by Interact | Tous droits réservés."]);

//   const csvString = csvData.map((row) => row.join(",")).join("\n");

//   // Create a Blob and trigger download
//   const blob = new Blob([csvString], { type: "text/csv" });
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${title.replace(/\s+/g, "_")}.csv`;
//   a.click();
//   window.URL.revokeObjectURL(url);
// };

const generateCSV = ({ groupedData, title, salespoint }) => {
  const rows = [];

  // --- En-tête du point de vente ---
  rows.push([salespoint?.name || "N/A"]);
  rows.push(["Adresse", salespoint?.address || "N/A"]);
  rows.push(["Numéro", salespoint?.number || "N/A"]);
  rows.push(["Email", salespoint?.email || "N/A"]);
  rows.push([]);
  rows.push([title.toUpperCase()]);
  rows.push([]);

  // --- Données groupées par client ---
  Object.entries(groupedData).forEach(([customerId, customerData], index) => {
    rows.push([`Client ID: ${customerId}`]);

    Object.entries(customerData).forEach(([catId, cat]) => {
      rows.push([`Catégorie: ${catId}`]);
      rows.push(["Code Produit", "Nom Produit", "Quantité Totale"]);

      Object.entries(cat).forEach(([productId, product]) => {
        rows.push([
          product.code || "N/A",
          productId || "N/A",
          product.quantity ?? 0
        ]);
      });

      rows.push([]);
    });

    if (index < Object.keys(groupedData).length - 1) {
      rows.push([]);
    }
  });

  // --- Pied de page ---
  rows.push([]);
  rows.push([`Généré le : ${moment().format("DD/MM/YYYY HH:mm:ss")}`]);
  rows.push(["© 2025 InventoryFlow by Interact | Tous droits réservés."]);

  // Génération CSV avec papaparse
  const csvString = unparse(rows, {
    quotes: true,
    skipEmptyLines: false
  });

  // BOM pour Excel
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Déclenche le téléchargement
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export { groupBySupplierAndCategory, generateCSV };
