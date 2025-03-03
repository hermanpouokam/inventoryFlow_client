'use client'
export const dynamic = "force-dynamic";
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    display: "flex",
    alignItems: "center",
  },
  tableContainer: {
    border: 1.5,
    borderColor: "#000",
  },
  section: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: 0,
    margin: 0,
    borderTop: 1,
  },
  tableCell: {
    width: 65,
    height: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  cellText: {
    fontSize: 9,
  },
  bottomText: {
    position: "absolute",
    bottom: 9,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#5f5f5f",
  },
});

interface Product {
  product_name: string;
  total_quantity: number;
}

interface CustomerData {
  customer_name: string;
  total_amount: number;
  total_package: number;
  total_package_recorded: number;
  total_products: {
    [productId: string]: Product;
  };
}

interface GroupedData {
  [customerId: string]: CustomerData;
}

interface GroupedDataPDFProps {
  groupedData: GroupedData;
  title: string;
  salespoint: SalesPoint | undefined;
  orientation: string;
}

const GroupedDataPDF: React.FC<GroupedDataPDFProps> = ({
  groupedData,
  title,
  salespoint,
  orientation = "portrait",
}) => {
  const listAllProducts = (groupedData: GroupedData) => {
    const products: { [productId: string]: string } = {};
    Object.values(groupedData).forEach((customer) => {
      Object.entries(customer.total_products).forEach(
        ([productId, productDetails]) => {
          if (!products[productId]) {
            products[productId] = productDetails.product_name;
          }
        }
      );
    });
    return products;
  };

  const allProducts = listAllProducts(groupedData);
  const productArray = Object.entries(allProducts).map(([id, name]) => ({
    id,
    name,
  }));

  return (
    <Document>
      <Page
        size={"A4"}
        //@ts-ignore
        orientation={orientation}
        style={styles.page}
      >
        <View
          style={{
            marginBottom: 25,
            border: 2,
            width: "100%",
            borderStyle: "dashed",
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontSize: 25,
              textAlign: "center",
            }}
          >
            {salespoint?.name}
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <Text style={{ fontSize: 9 }}>
              Adresse: {salespoint?.address ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9 }}>
              Numéro: {salespoint?.number ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9 }}>
              Email: {salespoint?.email ?? "N/A"}
            </Text>
          </View>
        </View>
        <Text
          style={{
            width: "100%",
            fontSize: 15,
            marginBottom: 10,
            textAlign: "center",
            textDecoration: "underline",
            color: "#e74c3c",
          }}
        >
          {title}
        </Text>
        <View style={styles.tableContainer}>
          <View style={[styles.section, { borderTop: 0 }]}>
            <View style={[styles.tableCell]}></View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { border: 0 }
                      : {},
                  ]}
                >
                  <Text style={styles.cellText}>
                    {customerData.customer_name}
                  </Text>
                </View>
              )
            )}
          </View>
          <View style={[styles.section]}>
            <View style={[styles.tableCell]}>
              <Text style={[styles.cellText, { color: "#5f27cd" }]}>
                Total emb.
              </Text>
            </View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { border: 0 }
                      : {},
                  ]}
                >
                  <Text style={styles.cellText}>
                    {customerData.total_package}
                  </Text>
                </View>
              )
            )}
          </View>
          <View style={[styles.section]}>
            <View style={[styles.tableCell]}>
              <Text style={[styles.cellText, { color: "#5f27cd" }]}>
                Total emb. cons.
              </Text>
            </View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { border: 0 }
                      : {},
                  ]}
                >
                  <Text style={styles.cellText}>
                    {customerData.total_package_recorded}
                  </Text>
                </View>
              )
            )}
          </View>
          <View style={styles.section}>
            <View style={[styles.tableCell]}>
              <Text style={[styles.cellText, { color: "#5f27cd" }]}>
                Montant Total
              </Text>
            </View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { border: 0 }
                      : {},
                  ]}
                >
                  <Text style={styles.cellText}>
                    {customerData.total_amount}
                  </Text>
                </View>
              )
            )}
          </View>
          {productArray.map((el) => (
            <View style={styles.section} key={el.id}>
              <View style={[styles.tableCell]}>
                <Text style={styles.cellText}>{el.name}</Text>
              </View>
              {Object.entries(groupedData).map(
                ([customerId, customerData], i) => (
                  <View
                    key={customerId}
                    style={[
                      styles.tableCell,
                      i === Object.entries(groupedData).length - 1
                        ? { border: 0 }
                        : {},
                    ]}
                  >
                    <Text style={styles.cellText}>
                      {customerData.total_products[el.id]?.total_quantity ?? 0}
                    </Text>
                  </View>
                )
              )}
            </View>
          ))}
        </View>
        <Text style={[styles.bottomText, { left: 0 }]} fixed>
          © 2025 InventoryFlow by Interact | Tous droits reservés.
        </Text>
        <Text style={[styles.bottomText, { right: 5 }]} fixed>
          {moment().format("DD/MM/YYYY hh:mm:ss")}
        </Text>
      </Page>
    </Document>
  );
};

export default GroupedDataPDF;
