import React from "react";
import i18n from "i18next";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import { formatteCurrency } from "../(admin)/stock/functions";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    display: "flex",
    alignItems: "center",
  },
  tableContainer: {
    borderWidth: 1,
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
  },
  tableCell: {
    paddingVertical: 7,
    paddingHorizontal: 5,
    // display: "flex",
    flex: 1,
    textAlign: "center",
    margin: 0,
    fontSize: 12,
    borderRightWidth: 1,
    borderColor: "#CBD5E1",
  },
  table: {
    //@ts-ignore
    display: "table",
    width: "100%",
    marginVertical: 10,
  },
  tableHeader: {
    backgroundColor: "#EEF2FF",
    fontWeight: "bold",
  },
  header: {
    borderBottom: 2,
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
    borderColor: "#CBD5E1",
  },
  bottomText: {
    position: "absolute",
    bottom: 9,
    textAlign: "center",
    fontSize: 8,
    color: "#5f5f5f",
  },
});

interface GroupedDataPDFProps {
  products: ProductVariant[];
  title: string;
  salespoint: SalesPoint | null;
}

const StockPDF: React.FC<GroupedDataPDFProps> = ({
  products,
  title,
  salespoint,
}) => {

  const { t } = useTranslation('common');

  return (
    <Document>
      <Page
        size={"A4"}
        //@ts-ignore
        style={styles.page}
      >
        <View
          style={{
            marginBottom: 25,
            borderWidth: 1,
            width: "100%",
            borderColor: "#CBD5E1",
            borderRadius: 10,
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
            <Text style={{ fontSize: 9 }}>
              {t("pdf.address")}: {salespoint?.address ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9 }}>
              {t("pdf.phone")}: {salespoint?.number ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9 }}>
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

        <View style={[styles.table, {
          borderWidth: 1,
          borderColor: "#CBD5E1",
        }]}>
          <View style={[styles.tableRow, styles.tableHeader, { borderTop: 0 }]}>
            <Text style={styles.tableCell}>{t("bills.columns.code")}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{t("article")}</Text>
            <Text style={styles.tableCell}>{t("quantity")}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{t("purchase_price")}</Text>
            <Text style={[styles.tableCell, { flex: 1.5, borderRight: 0 }]}>{t("total")}</Text>
          </View>
          {products?.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{product.product_code}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {product.name}
              </Text>
              <Text style={styles.tableCell}>{product.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{Number(product.price)}</Text>
              <Text
                style={[styles.tableCell, { flex: 1.5, textAlign: "right", borderRight: 0 }]}
              >
                {formatteCurrency(Number(product.price) * product.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}></Text>
            <Text style={[styles.tableCell, { fontWeight: "bold", flex: 2 }]}>
              {t("total")}
            </Text>
            <Text style={styles.tableCell}>
              {products?.reduce((acc, curr) => (acc += curr.quantity), 0)}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>-</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
              {formatteCurrency(
                products.reduce((acc, curr) => {
                  return (acc += curr.quantity * Number(curr.price));
                }, 0)
              )}
            </Text>
          </View>
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

StockPDF.displayName = "StockPDF";

export default StockPDF;
