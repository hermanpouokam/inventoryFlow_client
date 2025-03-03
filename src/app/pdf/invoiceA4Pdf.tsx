import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatteCurrency } from "../(admin)/stock/functions";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  container: {
    margin: "0 auto",
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
    border: "2px solid #2d3436",
    borderStyle: "dashed",
    borderRadius: 5,
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
    borderBottom: "1px solid #ddd",
    textAlign: "right",
  },
  tableHeader: {
    backgroundColor: "#eee",
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

const InvoicePDF = ({ bill }: { bill: Bill | null }) => {
  return (
    <Document>
      <Page style={styles.page} size="A4">
        <View style={[styles.container, { justifyContent: "space-between" }]}>
          <Text style={styles.title}>{bill?.sales_point_details.name}</Text>
          <View style={styles.tableRow}>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              N<sup>o</sup> CONT: N/A
            </Text>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              Adresse: {bill?.sales_point_details.address ?? "N/A"}
            </Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              E-MAIL: {bill?.sales_point_details?.email ?? "N/A"}
            </Text>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              Numéro: {bill?.sales_point_details.number ?? "N/A"}
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
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.subtitle}>
              Facture N<sup>o</sup>: {bill?.bill_number}
            </Text>
            <Text style={styles.subtitle}>Client: {bill?.customer_name}</Text>
            <Text style={styles.subtitle}>
              Code client:{" "}
              {bill?.customer_details ? bill?.customer_details.code : "N/A"}
            </Text>
          </View>
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.subtitle}>
              Operateur : {bill?.operator_details?.name}{" "}
              {bill?.operator_details?.surname}
            </Text>
            <Text style={styles.subtitle}>
              Livreur :{" "}
              {bill?.deliverer ? bill?.deliverer_details?.name : "N/A"}{" "}
            </Text>
            {/* @ts-ignore */}
            <Text style={styles.subtitle}>
              {/* @ts-ignore */}
              Créer le: {new Date(bill?.created_at).toLocaleString()}
            </Text>
            <Text style={styles.subtitle}>
              {/* @ts-ignore */}
              Echéance :{" "}
              {bill?.cashed
                ? new Date(bill?.cashed_at).toLocaleString()
                : new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.subtitle}>
              Imprimer le: {new Date().toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle, { marginTop: 5 }]}>Produits</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Code</Text>
            <Text style={styles.tableCell}>Produits</Text>
            <Text style={styles.tableCell}>Quantité</Text>
            <Text style={styles.tableCell}>Prix</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {bill?.product_bills.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>
                {product.product_details.product_code}
              </Text>
              <Text style={styles.tableCell}>
                {product.product_details.name}
              </Text>
              <Text style={styles.tableCell}>{product.quantity}</Text>
              <Text style={styles.tableCell}>{product.price}</Text>
              <Text style={styles.tableCell}>
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
              Total
            </Text>
            <Text style={styles.tableCell}>
              {bill?.product_bills.reduce(
                (acc, curr) => (acc += curr.quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCell}>
              {formatteCurrency(bill?.total_bill_amount ?? 0, "XAF", "fr-FR")}
            </Text>
          </View>
        </View>
        {bill?.product_bills.some(
          (productBill) => productBill.package_product_bill !== null
        ) && (
          <>
            <Text style={[styles.subtitle, { marginTop: 5 }]}>Articles</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Désignation</Text>
                <Text style={styles.tableCell}>Emballage</Text>
                <Text style={styles.tableCell}>Consigné</Text>
                <Text style={styles.tableCell}>Prix</Text>
                <Text style={styles.tableCell}>Total</Text>
              </View>
              {bill?.product_bills.map((product: ProductBill, index) => {
                const packageProduct = product?.package_product_bill;
                if (packageProduct) {
                  return (
                    <View style={styles.tableRow} key={index}>
                      <Text style={styles.tableCell}>
                        {product.product_details.product_code}
                      </Text>
                      <Text style={styles.tableCell}>
                        {packageProduct.packaging_details.name}
                      </Text>
                      <Text style={styles.tableCell}>
                        {packageProduct.record}
                      </Text>
                      <Text style={styles.tableCell}>
                        {packageProduct.packaging_details.price}
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
                <Text
                  style={[styles.tableCell, { fontWeight: "bold" }]}
                  //@ts-ignore
                  colSpan={4}
                >
                  Total
                </Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCell}>
                  {formatteCurrency(bill?.total_amount, "XAF", "fr-FR")}
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
                {formatteCurrency(tax.rate, "XAF", "fr-FR")}
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
            Net à payer:
          </Text>
          <Text style={[styles.subtitle]}>
            {formatteCurrency(bill?.total_amount_with_taxes_fees)}
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
          <Text style={styles.signature}>Signature du vendeur</Text>
          <Text style={styles.signature}>Signature du client</Text>
        </View>
        <View
          style={[
            styles.tableRow,
            {
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 100,
            },
          ]}
        >
          <Text style={styles.footer}></Text>
          <Text style={styles.footer}>
            © 2025 InventoryFlow by Interact | Tous droits reservés.
          </Text>
          <Text style={styles.footer}>{new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
