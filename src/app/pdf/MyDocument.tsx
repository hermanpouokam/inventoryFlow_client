import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import { formatNumber } from "../(admin)/stock/functions";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    display: "flex",
    alignItems: "center",
  },
  tableContainer: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
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
    borderColor: "#CBD5E1"
  },
  tableCell: {
    width: 120,
    height: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    borderRightWidth: 1,
    borderColor: "#CBD5E1",
    overflow: 'hidden'
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
  const { t } = useTranslation('common');

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
            borderWidth: 1,
            width: "100%",
            borderStyle: "solid",
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
            <Text style={[{ fontSize: 9, textTransform: "uppercase" }]}>
              {t("invoice.contract_number")}: {salespoint?.nc ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>
              {t("pdf.address")}: {salespoint?.address ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>
              {t("pdf.phone")}: {salespoint?.number ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>
              {t("pdf.email")}: {salespoint?.email ?? "N/A"}
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
            color: "#1E3A8A",
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
                      ? { borderWidth: 0.1 }
                      : {},
                  ]}
                >
                  <Text
                    style={[styles.cellText, { textTransform: "capitalize" }]}
                  >
                    {customerData.customer_name}
                  </Text>
                </View>
              )
            )}
          </View>
          <View style={[styles.section]}>
            <View style={[styles.tableCell]}>
              <Text style={[styles.cellText, { color: "#5f27cd" }]}>
                {t("roadmap.excel.total_packages")}
              </Text>
            </View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { borderWidth: 0.1 }
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
                {t("roadmap.excel.total_packages_recorded")}
              </Text>
            </View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { borderWidth: 0.1 }
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
                {t("roadmap.excel.total_amount")}
              </Text>
            </View>
            {Object.entries(groupedData).map(
              ([customerId, customerData], i) => (
                <View
                  key={customerId}
                  style={[
                    styles.tableCell,
                    i === Object.entries(groupedData).length - 1
                      ? { borderWidth: 0.1 }
                      : {},
                  ]}
                >
                  <Text style={styles.cellText}>
                    {formatNumber(customerData.total_amount)}
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
                        ? { borderWidth: 0.5 }
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
        <Text
          style={[styles.bottomText, { left: 5 }]}
          render={({ pageNumber, totalPages }) =>
            t("pdf.page_count", { page: pageNumber, total: totalPages })
          }
          fixed
        />
        <Text style={[styles.bottomText, { left: 0, right: 0 }]} fixed>
          {"\u00a9 2025 InventoryFlow by Interact | "}{t("pdf.all_rights_reserved")}
        </Text>
        <Text style={[styles.bottomText, { right: 5 }]} fixed>
          {moment().format("DD/MM/YYYY hh:mm:ss")}
        </Text>
      </Page>
    </Document>
  );
};

export default GroupedDataPDF;
