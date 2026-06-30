import React, { useEffect, useState } from "react";
import i18n from "i18next";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import { formatteCurrency } from "../(admin)/stock/functions";
import JsBarcode from "jsbarcode";
import { useTranslation } from "react-i18next";
import { generateQRCodeBase64 } from "./invoiceA4Pdf";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  container: {
    margin: "0 auto",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(99, 110, 114,0.2)",
    border: "1px solid #CBD5E1",
    borderStyle: "solid",
    borderRadius: 8,
    width: "100%",
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 7,
    marginBottom: 5,
    marginRight: 5,
    textTransform: "uppercase",
  },
  table: {
    //@ts-ignore
    display: "table",
    width: "100%",
    marginVertical: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    padding: 2,
    fontSize: 6,
    borderBottom: "1px solid #E2E8F0",
    textAlign: "right",
  },
  tableHeader: {
    backgroundColor: "#EEF2FF",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 5,
    // marginTop: 20,
    color: "#34495e",
  },
  signature: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 7,
    fontWeight: "bold",
  },
});

const calculateHeight = (bill: Bill | null) => {
  const baseHeight = 400; // Hauteur minimale
  const extraHeightPerItem = 65; // Hauteur supplémentaire par élément
  return (
    baseHeight +
    (bill?.product_bills?.length ?? 0) * extraHeightPerItem +
    (bill?.product_bills?.filter((pd) => pd.package_product_bill !== null)?.length ?? 0) *
    extraHeightPerItem
  );
};

const generateBarcodeBase64 = (value: string) => {
  const canvas = document.createElement("canvas");

  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 80,
    displayValue: false,
  });

  return canvas.toDataURL("image/png");
};




const InvoiceSmallPDF = ({ bill }: { bill: Bill | null }) => {

  const { t } = useTranslation('common');
  const pageHeight = calculateHeight(bill);

  const [qrImage, setQrImage] = useState<string | null>(null)

  useEffect(() => {
    generateQRCodeBase64(bill?.sales_point_details?.id).then(setQrImage)
  }, [bill?.sales_point_details?.id])

  const barcodeImage = generateBarcodeBase64(
    bill?.bill_number ?? "000000"
  );

  return (
    <Document>
      <Page style={styles.page} size={[250, pageHeight]}>
        <View style={[styles.container, { justifyContent: "space-between" }]}>
          <Text style={styles.title}>{bill?.sales_point_details.name}</Text>
          <View style={[styles.tableRow, { flexWrap: "wrap" }]}>
            <Text style={[styles.subtitle]}>
              {t("invoice.contract_number")}: {bill?.sales_point_details?.nc ?? "N/A"}
            </Text>
            <Text style={[styles.subtitle]}>
              {t("pdf.address")}: {bill?.sales_point_details.address}
            </Text>
            <Text style={[styles.subtitle]}>
              {t("pdf.email")}: {bill?.sales_point_details?.email ?? "N/A"}
            </Text>
            <Text style={[styles.subtitle]}>
              {t("pdf.phone")}: {bill?.sales_point_details.number ?? "N/A"}
            </Text>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ marginVertical: 10 }}>
            <Image
              src={barcodeImage}
              style={{ width: 130, height: 50, marginLeft: -5 }}
            />
            <Text style={styles.subtitle}>
              {t("invoice.number")}: {bill?.bill_number}
            </Text>
            <Text style={styles.subtitle}>{t("customer")}: {bill?.customer_name}</Text>
            <Text style={styles.subtitle}>
              {t("customer_code")}: {bill?.customer_details?.code}
            </Text>
            <Text style={styles.subtitle}>
              {t("operator")} : {bill?.operator_details?.name}{" "}
              {bill?.operator_details?.surname}
            </Text>
            <Text style={styles.subtitle}>
              {t("deliverer.label")} :{" "}
              {bill?.deliverer ? bill?.deliverer_details?.name : "N/A"}{" "}
            </Text>
            <Text style={styles.subtitle}>
              {t("pdf.created_on")}: {new Date(bill?.created_at ?? "").toLocaleString()}
            </Text>
            <Text style={styles.subtitle}>
              {t("checkout.due_date")}: {" "}
              {bill?.cashed
                ? new Date(bill?.cashed_at).toLocaleString()
                : new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.subtitle}>
              {t("pdf.printed_on")}: {new Date().toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle]}>{t("pdf.items")}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>{t("bills.columns.code")}</Text>
            <Text style={[styles.tableCell, { flex: 3, textAlign: "center" }]}>
              {t("checkout.designation")}
            </Text>
            <Text style={styles.tableCell}>{t("pdf.qty")}</Text>
            <Text style={styles.tableCell}>{t("pdf.unit_price")}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{t("total")}</Text>
          </View>
          {bill?.product_bills.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>
                {product.product_details.product_code}
              </Text>
              <Text
                style={[styles.tableCell, { flex: 3, textAlign: "center" }]}
              >
                {product.product_details.name}
              </Text>
              <Text style={styles.tableCell}>{product.quantity}</Text>
              <Text style={styles.tableCell}>{product.price}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {Number(product.total_amount)}
              </Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}></Text>
            <Text
              style={[
                styles.tableCell,
                { fontWeight: "bold", flex: 3, textAlign: "center" },
              ]}
            //@ts-ignore
            >
              {t("total")}
            </Text>
            <Text style={styles.tableCell}>
              {bill?.product_bills.reduce(
                (acc, curr) => (acc += curr.quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {Number(
                bill?.product_bills.reduce((acc, curr) => {
                  return (acc += curr.total_amount);
                }, 0) ?? 0
              )}
            </Text>
          </View>
        </View>
        {bill?.product_bills.some(
          (productBill) => productBill.package_product_bill !== null
        ) && (
            <>
              <Text style={[styles.subtitle, { marginTop: 5 }]}>{t("pdf.packaging")}</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>{t("article")}</Text>
                  <Text
                    style={[styles.tableCell, { flex: 3, textAlign: "center" }]}
                  >
                    {t("pdf.packaging_item")}
                  </Text>
                  <Text style={styles.tableCell}>{t("invoice.consigned")}</Text>
                  <Text style={styles.tableCell}>{t("pdf.unit_price")}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{t("total")}</Text>
                </View>
                {bill?.product_bills.map((product: ProductBill, index) => {
                  const packageProduct = product?.package_product_bill;
                  if (packageProduct) {
                    return (
                      <View style={styles.tableRow} key={index}>
                        <Text style={styles.tableCell}>
                          {product.product_details.product_code}
                        </Text>
                        <Text
                          style={[
                            styles.tableCell,
                            { flex: 3, textAlign: "center" },
                          ]}
                        >
                          {packageProduct.name}
                        </Text>
                        <Text style={styles.tableCell}>
                          {packageProduct.record}
                        </Text>
                        <Text style={styles.tableCell}>
                          {Number(packageProduct.price)}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 2 }]}>
                          {Number(packageProduct.total_amount)}
                        </Text>
                      </View>
                    );
                  }
                })}
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}></Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontWeight: "bold", flex: 3, textAlign: "center" },
                    ]}
                  >
                    {t("total")}
                  </Text>
                  <Text style={styles.tableCell}>
                    {bill.product_bills.reduce((acc, curr) => {
                      const pkg = curr.package_product_bill;
                      return (acc += Number(pkg?.record));
                    }, 0)}
                  </Text>
                  <Text style={styles.tableCell}>-</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {Number(
                      bill.product_bills.reduce((acc, curr) => {
                        const pkg = curr.package_product_bill;
                        return (acc += Number(pkg?.record ?? 0) * Number(pkg?.price ?? 0)
                        );
                      }, 0)
                    )}
                  </Text>
                </View>
              </View>
            </>
          )}

        <View>
          {bill?.taxes.map((tax, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{tax.name}</Text>
              <Text style={styles.tableCell}>
                {formatteCurrency(tax.amount)}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={[
            styles.tableRow,
            {
              marginTop: 5,
              justifyContent: "flex-end",
              alignItems: "center",
            },
          ]}
        >
          <Text style={[styles.subtitle]}></Text>
          <Text style={[styles.subtitle, { marginHorizontal: 5 }]}>
            {t("pdf.net_to_pay")}:
          </Text>
          <Text style={[styles.subtitle]}>
            {formatteCurrency(bill?.total_amount_with_taxes_fees ?? 0)}
          </Text>
        </View>

        <View
          style={[
            styles.tableRow,
            {
              justifyContent: "space-around",
              alignItems: "center",
            },
          ]}
        >
          <Text style={styles.signature}>{t("invoice.seller_signature")}</Text>
          <Text style={styles.signature}>{t("invoice.customer_signature")}</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 10,
            right: 10,
          }}
        >
          {/* QR Code centré */}
          {qrImage && (
            <View style={{ alignItems: "flex-end", marginBottom: -5 }}>
              <Image src={qrImage} style={{ width: 30, height: 30 }} />
              <Text style={[styles.footer, { marginTop: 2, fontSize: 5 }]}>
                {t("pdf.remark_prompt")}
              </Text>
            </View>
          )}

          {/* Copyright */}
          <View style={[styles.tableRow, { justifyContent: "flex-start" }]}>
            <Text style={styles.footer}>
              {new Date().toLocaleString()} {`\u00a9 ${new Date().getFullYear()} InventoryFlow by Interact | `}{t("pdf.all_rights_reserved")}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceSmallPDF;
