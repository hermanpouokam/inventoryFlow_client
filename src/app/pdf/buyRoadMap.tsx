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
  subtitle: {
    fontSize: 10,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  tableContainer: {
    borderWidth: 1.5,
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
    paddingVertical: 7,
    paddingHorizontal: 5,
    display: "flex",
    textAlign: "left",
    margin: 0,
    fontSize: 12,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  header: {
    borderBottom: 2,
    // borderTop: 2,
    width: "100%",
    borderStyle: "solid",
  },
  cellText: {
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    width: "100%",
    borderTop: 1,
  },
  bottomText: {
    position: "absolute",
    bottom: 9,
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
  salespoint: SalesPoint | null;
}

const BuyRoadmap: React.FC<GroupedDataPDFProps> = ({
  groupedData,
  title,
  salespoint,
}) => {
  return (
    <Document>
      <Page
        size={"A4"}
        //@ts-ignore
        style={styles.page}
      >
        <View style={[styles.container, { justifyContent: "space-between" }]}>
          <Text style={styles.title}>{salespoint?.name}</Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              N<sup>o</sup> CONT: N/A
            </Text>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              Adresse: {salespoint?.address ?? "N/A"}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              E-MAIL: {salespoint?.email ?? "N/A"}
            </Text>
            <Text style={[styles.subtitle, { flex: 1 }]}>
              Numéro: {salespoint?.number ?? "N/A"}
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
        <>
          {Object.entries(groupedData).map(([key, value], index) => (
            <View
              style={{
                marginBottom: 10,
                width: "100%",
                borderWidth: 2,
                borderColor: "#000",
                borderStyle: "solid",
                padding: 0,
              }}
            >
              <View
                style={[
                  styles.header,
                  {
                    borderStyle: "solid",
                    padding: 5,
                    backgroundColor: "rgba(0,0,0,.2)",
                    borderBottom: 0,
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>{key}</Text>
              </View>
              {Object.entries(value).map(([cat, catValue], index) => (
                <>
                  <View
                    style={[
                      styles.header,
                      {
                        borderStyle: "solid",
                        padding: 3,
                        borderTop: 2,
                        fontSize: 15,
                        margin: 0,
                      },
                    ]}
                  >
                    <Text style={{ textAlign: "center" }}>{cat}</Text>
                  </View>
                  <>
                    {Object.entries(catValue).map(
                      ([productKey, product], index) => (
                        <View
                          style={[
                            styles.tableRow,
                            { borderTop: index == 0 ? 0 : 1 },
                          ]}
                          key={index}
                        >
                          <Text style={[styles.tableCell]}>{index + 1}</Text>
                          <Text style={[styles.tableCell, { width: "30%" }]}>
                            {product?.code}
                          </Text>
                          <Text
                            style={[
                              styles.tableCell,
                              { width: "55%", textAlign: "center" },
                            ]}
                          >
                            {productKey}
                          </Text>
                          <Text
                            style={[
                              styles.tableCell,
                              {
                                borderRight: 0,
                                textAlign: "right",
                                width: "15%",
                              },
                            ]}
                          >
                            {product?.quantity}
                          </Text>
                        </View>
                      )
                    )}
                    <View
                      style={[
                        styles.tableRow,
                        // { borderTop: index == 0 ? 0 : 1 },
                      ]}
                      key={index}
                    >
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "85.5%", textAlign: "right" },
                        ]}
                      >
                        Total
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            borderRight: 0,
                            textAlign: "right",
                            width: "14.5%",
                          },
                        ]}
                      >
                        {Object.values(catValue).reduce((acc, curr) => {
                          return acc + curr.quantity;
                        }, 0)}
                      </Text>
                    </View>
                  </>
                </>
              ))}
            </View>
          ))}
        </>
        <Text
          style={[styles.bottomText, { left: 5 }]}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} sur ${totalPages}`
          }
          fixed
        />
        <Text style={[styles.bottomText, { left: 0, right: 0 }]} fixed>
          © 2025 InventoryFlow by Interact | Tous droits reservés.
        </Text>
        <Text style={[styles.bottomText, { right: 5 }]} fixed>
          {moment().format("DD/MM/YYYY hh:mm:ss")}
        </Text>
      </Page>
    </Document>
  );
};

BuyRoadmap.displayName = "BuyRoadmap";

export default BuyRoadmap;
