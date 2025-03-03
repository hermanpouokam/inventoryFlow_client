'use client'
export const dynamic = "force-dynamic";
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatteCurrency } from "../(admin)/stock/functions";
import { statusBuy } from "@/utils/constants";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    width: "100%",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    textDecoration: "underline",
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

const translates = {
  packaging_details: "emballages",
  tax_details: "Taxes",
  fee_details: "frais supplementaires",
};

const SupplyPdf = ({ supply }: { supply: Supply | null }) => {
  const packagingDetails = supply?.invoice_history[0]?.packaging_details;
  const totalPackagings = Object.keys(packagingDetails).reduce((curr, key) => {
    const packaging = packagingDetails[key];
    return (curr +=
      Number(packaging.packaging_cost) * Number(packaging.missing_quantity));
  }, 0);
  const taxDetails = supply?.invoice_history[0]?.tax_details;
  const feeDetails = supply?.invoice_history[0]?.fee_details;
  return (
    <Document>
      <Page style={styles.page} size="A4">
        <View style={[styles.container]}>
          <Text style={[styles.title, { marginBottom: 10 }]}>
            {supply?.sales_point_details.name}
          </Text>
          <Text style={styles.title}>
            Bon de commande N<sup>o</sup> {supply?.supply_number}
          </Text>
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
            <Text style={styles.subtitle}>
              Fournisseur: {supply?.supplier_details.name}
            </Text>
            <Text style={styles.subtitle}>
              Status: {statusBuy[supply?.status]}
            </Text>
          </View>
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.subtitle}>
              Operateur : {supply?.operator_details?.name}{" "}
              {supply?.operator_details?.surname}
            </Text>
            <Text style={styles.subtitle}>
              {/* @ts-ignore */}
              Créer le: {new Date(supply?.created_at).toLocaleString()}
            </Text>
            <Text style={styles.subtitle}>
              Imprimer le: {new Date().toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Code</Text>
            <Text style={styles.tableCell}>Article</Text>
            <Text style={styles.tableCell}>Quantité</Text>
            <Text style={styles.tableCell}>Prix</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {supply?.supply_products.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>
                {product.product_details.product_code}
              </Text>
              <Text style={styles.tableCell}>
                {product.product_details.name}
              </Text>
              <Text style={styles.tableCell}>{product.quantity}</Text>
              <Text style={styles.tableCell}>{Number(product.price)}</Text>
              <Text style={styles.tableCell}>
                {formatteCurrency(Number(product.price), "XAF", "fr-FR")}
              </Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}></Text>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              Total
            </Text>
            <Text style={styles.tableCell}>
              {supply?.supply_products.reduce(
                (acc, curr) => (acc += curr.quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCell}>
              {formatteCurrency(supply?.total_cost ?? 0, "XAF", "fr-FR")}
            </Text>
          </View>
        </View>
        <View>
          {Object.keys(packagingDetails).length > 0 && (
            <>
              <Text style={[styles.subtitle, { marginTop: 5 }]}>
                Emballages
              </Text>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Article</Text>
                <Text style={styles.tableCell}>Emballage</Text>
                <Text style={styles.tableCell}>Manquant</Text>
                <Text style={styles.tableCell}>Prix</Text>
                <Text style={styles.tableCell}>Total</Text>
              </View>
              {Object.keys(packagingDetails).map((obj) => {
                const packaging = packagingDetails[obj];
                return (
                  <View key={obj} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{obj}</Text>
                    <Text style={styles.tableCell}>{packaging.name}</Text>
                    <Text style={styles.tableCell}>
                      {packaging.missing_quantity}
                    </Text>
                    <Text style={styles.tableCell}>
                      {packaging.packaging_cost}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatteCurrency(
                        Number(packaging.packaging_cost) *
                          packaging.missing_quantity,
                        "XAF",
                        "fr-FR"
                      )}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}></Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  Total
                </Text>
                <Text style={styles.tableCell}>
                  {Object.values(packagingDetails).reduce((acc, curr) => {
                    return (acc += Number(curr.missing_quantity));
                  }, 0)}
                </Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCell}>
                  {formatteCurrency(totalPackagings, "XAF", "fr-FR")}
                </Text>
              </View>
            </>
          )}
        </View>
        <View>
          {Number(taxDetails?.total_tax_amount) > 0 && (
            <>
              <Text style={[styles.subtitle, { marginTop: 5 }]}>Taxes: </Text>
              {taxDetails?.breakdown?.map((obj, i) => {
                return (
                  <View key={i} style={{}}>
                    <Text
                      style={[
                        styles.tableCell,
                        { textAlign: "right", borderWidth: 0 },
                      ]}
                    >
                      {obj.tax_name} :{"     "}
                      {formatteCurrency(obj.tax_amount, "XAF", "fr-FR").replace(
                        "/",
                        ""
                      )}
                    </Text>
                  </View>
                );
              })}
              <Text
                style={[
                  styles.tableCell,
                  {
                    textAlign: "right",
                    borderWidth: 0,
                    fontWeight: "bold",
                    marginTop: 5,
                  },
                ]}
              >
                Total :{"    "}
                {formatteCurrency(
                  Number(taxDetails?.total_tax_amount),
                  "XAF",
                  "fr-FR"
                ).replace("/", "")}
              </Text>
            </>
          )}
        </View>
        <View>
          {Number(feeDetails?.total_fee_amount) > 0 && (
            <View style={{ marginTop: 15 }}>
              <Text style={[styles.subtitle, { marginTop: 5 }]}>
                Frais supplementaires :{" "}
              </Text>
              {feeDetails?.breakdown?.map((obj, i) => {
                return (
                  <View key={i} style={{}}>
                    <Text
                      style={[
                        styles.tableCell,
                        {
                          textAlign: "right",
                          borderWidth: 0,
                        },
                      ]}
                    >
                      {obj.fee_name} :{"     "}
                      {formatteCurrency(obj.fee_amount, "XAF", "fr-FR").replace(
                        "/",
                        ""
                      )}
                    </Text>
                  </View>
                );
              })}
              <Text
                style={[
                  styles.tableCell,
                  {
                    textAlign: "right",
                    borderWidth: 0,
                    fontWeight: "bold",
                    marginTop: 5,
                  },
                ]}
              >
                Total :{"    "}
                {formatteCurrency(
                  Number(feeDetails?.total_fee_amount),
                  "XAF",
                  "fr-FR"
                ).replace("/", "")}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.tableRow,
            {
              marginTop: 20,
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
            {formatteCurrency(
              Number(supply?.total_cost) +
                Number(taxDetails?.total_tax_amount) +
                Number(feeDetails?.total_fee_amount) +
                totalPackagings,
              "XAF",
              "fr-Fr"
            )}
          </Text>
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
          <Text style={styles.footer}>{new Date().toLocaleString()}</Text>
          <Text style={styles.footer}>
            © 2025 InventoryFlow by Interact | Tous droits reservés.
          </Text>
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} sur ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default SupplyPdf;
