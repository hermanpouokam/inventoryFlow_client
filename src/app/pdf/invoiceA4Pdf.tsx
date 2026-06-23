import React, { useEffect, useState } from "react";
import i18n from "i18next";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatteCurrency } from "../(admin)/stock/functions";
import Barcode from "react-barcode";
import JsBarcode from "jsbarcode";
import { Image } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode"

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  container: {
    margin: "0 auto",
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
    border: "1px solid #CBD5E1",
    borderStyle: "solid",
    borderRadius: 8,
    width: "100%",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  table: {
    //@ts-ignore
    display: "table",
    width: "100%",
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 2,
    padding: 5,
    fontSize: 8,
    borderBottom: "1px solid #E2E8F0",
    textAlign: "left",
  },
  tableHeader: {
    backgroundColor: "#EEF2FF",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 7,
    // marginTop: 20,
    color: "#34495e",
  },
  signature: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
});

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


export const generateQRCodeBase64 = async (salesPointId: number | undefined): Promise<string | null> => {
  if (!salesPointId) return null
  try {
    // URL vers la page publique de plainte
    const url = `${window.location.origin}/complaints/${salesPointId}`
    // qrcode génère directement un dataURL png
    const dataUrl = await QRCode.toDataURL(url, {
      width: 120,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    })
    return dataUrl
  } catch {
    return null
  }
}


const InvoicePDF = ({ bill }: { bill: Bill | null }) => {

  const { t } = useTranslation('common');
  const [qrImage, setQrImage] = useState<string | null>(null)

  useEffect(() => {
    generateQRCodeBase64(bill?.sales_point_details?.id).then(setQrImage)
  }, [bill?.sales_point_details?.id])

  const barcodeImage = generateBarcodeBase64(
    bill?.bill_number ?? "000000"
  );

  return (
    <Document>
      <Page style={styles.page} size="A4">
        <View style={[styles.container, { justifyContent: "space-between" }]}>
          <Text style={styles.title}>{bill?.sales_point_details.name}</Text>
          <View style={styles.tableRow}>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              {t("invoice.contract_number")}: {bill?.sales_point_details?.nc ?? "N/A"}
            </Text>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              {t("pdf.address")}: {bill?.sales_point_details.address ?? "N/A"}
            </Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              {t("pdf.email")}: {bill?.sales_point_details?.email ?? "N/A"}
            </Text>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              {t("pdf.phone")}: {bill?.sales_point_details.number ?? "N/A"}
            </Text>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ marginVertical: 20 }}>
            <Image
              src={barcodeImage}
              style={{ width: 150, height: 70, marginLeft: -5 }}
            />
            <Text style={styles.subtitle}>
              {t("invoice.number")}: {bill?.bill_number}
            </Text>
            <Text style={styles.subtitle}>{t("customer")}: {bill?.customer_name}</Text>
            <Text style={styles.subtitle}>
              {t("customer_code")}:{" "}
              {bill?.customer_details ? bill?.customer_details.code : "N/A"}
            </Text>
          </View>
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.subtitle}>
              {t("operator")} : {bill?.operator_details?.name}{" "}
              {bill?.operator_details?.surname}
            </Text>
            <Text style={styles.subtitle}>
              {t("deliverer.label")} :{" "}
              {bill?.deliverer ? bill?.deliverer_details?.name : "N/A"}{" "}
            </Text>
            {/* @ts-ignore */}
            <Text style={styles.subtitle}>
              {/* @ts-ignore */}
              {t("pdf.created_on")}: {new Date(bill?.created_at).toLocaleString()}
            </Text>
            <Text style={styles.subtitle}>
              {/* @ts-ignore */}
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

        <Text style={[styles.subtitle, { marginTop: 5 }]}>{t("pdf.items")}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>{t("bills.columns.code")}</Text>
            <Text style={styles.tableCell}>{t("article")}</Text>
            <Text style={[styles.tableCell, { textAlign: 'center' }]}>{t("quantity")}</Text>
            <Text style={styles.tableCell}>{t("price")}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>{t("total")}</Text>
          </View>
          {bill?.product_bills.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>
                {product.product_details.product_code.toUpperCase()}
              </Text>
              <Text style={styles.tableCell}>
                {product.product_details.name}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{product.quantity}</Text>
              <Text style={styles.tableCell}>{product.price}</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                {formatteCurrency(product.total_amount, "XAF", "fr-FR")}
              </Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}></Text>
            <Text
              style={[styles.tableCell, { fontWeight: "bold" }]}
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
            <Text style={styles.tableCell}>
              {formatteCurrency(bill?.total_amount || 0, "XAF", "fr-FR")}
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
                  <Text style={styles.tableCell}>{t("pdf.packaging_item")}</Text>
                  <Text style={styles.tableCell}>{t("invoice.consigned")}</Text>
                  <Text style={styles.tableCell}>{t("price")}</Text>
                  <Text style={styles.tableCell}>{t("total")}</Text>
                </View>
                {bill?.product_bills.map((product: ProductBill, index) => {
                  const packageProduct = product?.package_product_bill;
                  if (packageProduct) {
                    return (
                      <View style={styles.tableRow} key={index}>
                        <Text style={styles.tableCell}>
                          {product.product_details.product_code.toUpperCase()}
                        </Text>
                        <Text style={styles.tableCell}>
                          {packageProduct.name}
                        </Text>
                        <Text style={styles.tableCell}>
                          {packageProduct.record}
                        </Text>
                        <Text style={styles.tableCell}>
                          {Number(packageProduct.price)}
                        </Text>
                        <Text style={styles.tableCell}>
                          {formatteCurrency(
                            packageProduct.total_amount,
                            "XAF",
                            "fr-FR"
                          )}
                        </Text>
                      </View>
                    );
                  }
                })}
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}></Text>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {t("total")}
                  </Text>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                    {bill.product_bills.reduce((acc, curr) => {
                      const pk = curr?.package_product_bill;
                      return (acc += Number(pk?.record));
                    }, 0)}
                  </Text>
                  <Text style={styles.tableCell}>-</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                    {formatteCurrency(
                      bill?.product_bills.reduce((acc, curr) => {
                        return (acc += Number(
                          curr?.package_product_bill?.total_amount
                        ));
                      }, 0) ?? 0,
                      "XAF",
                      "fr-FR"
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
                {formatteCurrency(tax.amount, "XAF", "fr-FR")}
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
          style={[
            styles.tableRow,
            {
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 100,
            },
          ]}
        >
          {/* Copyright à gauche */}
          <View>
            <Text style={styles.footer}>
              {new Date().toLocaleString()} {`\u00a9 ${new Date().getFullYear()} InventoryFlow by Interact | `}{t("pdf.all_rights_reserved")}
            </Text>
          </View>

          {/* QR Code + label à droite */}
          {qrImage && (
            <View style={{ alignItems: "center" }}>
              <Image src={qrImage} style={{ width: 45, height: 45 }} />
              <Text style={[styles.footer, { marginTop: 3, fontSize: 6 }]}>
                Faites une remarque
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
