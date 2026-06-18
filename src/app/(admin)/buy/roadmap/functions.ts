import i18n from "i18next";
import moment from "moment";
import { parse } from "json2csv";
import { unparse } from "papaparse";
import { useTranslation } from "react-i18next";

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


const generateCSV = ({ groupedData, title, salespoint }) => {
  const { t } = useTranslation('common');
  const rows = [];

  // --- En-tête du point de vente ---
  rows.push([salespoint?.name || "N/A"]);
  rows.push([t("roadmap.csv.address"), salespoint?.address || "N/A"]);
  rows.push([t("roadmap.csv.phone"), salespoint?.number || "N/A"]);
  rows.push([t("roadmap.csv.email"), salespoint?.email || "N/A"]);
  rows.push([]);
  rows.push([title.toUpperCase()]);
  rows.push([]);

  // --- Données groupées par client ---
  Object.entries(groupedData).forEach(([customerId, customerData], index) => {
    rows.push([t("roadmap.csv.customer_id", { id: customerId })]);

    Object.entries(customerData).forEach(([catId, cat]) => {
      rows.push([t("roadmap.csv.category", { category: catId })]);
      rows.push([t("roadmap.csv.product_code"), t("roadmap.csv.product_name"), t("roadmap.csv.total_quantity")]);

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
  rows.push([t("roadmap.csv.generated_on", { date: moment().format("DD/MM/YYYY HH:mm:ss") })]);
  rows.push([t("roadmap.csv.footer")]);

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
