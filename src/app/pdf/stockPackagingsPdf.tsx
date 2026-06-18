import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import { formatteCurrency } from "../(admin)/stock/functions";
import i18n from "i18next";

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
    // borderTop: 1,
  },
  tableCell: {
    paddingVertical: 7,
    paddingHorizontal: 5,
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
  packagings: Packaging[];
  title: string;
  salespoint: SalesPoint | null;
}

const StockPackagingsPDF: React.FC<GroupedDataPDFProps> = ({
  packagings,
  title,
  salespoint,
}) => {
  const t = i18n.t.bind(i18n);
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
            fontSize: 16,
            fontWeight:'600',
            marginBottom: 10,
            textAlign: "center",
            textDecoration: "underline",
            color: "#047857",
          }}
        >
          {title}
        </Text>

        <View style={[styles.table, { borderLeftWidth: 1, borderBottomWidth: 1 }]}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 2.5 }]}>{t("packaging.columns.name")}</Text>
            <Text style={styles.tableCell}>{t("packaging.columns.full_quantity")}</Text>
            <Text style={styles.tableCell}>{t("packaging.columns.empty_quantity")}</Text>
            <Text style={styles.tableCell}>{t("pdf.total")}</Text>
            <Text style={styles.tableCell}>{t("packaging.columns.unit_price")}</Text>
            <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{t("packaging.columns.total_amount")}</Text>
          </View>
          {packagings?.map((packaging, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, { flex: 2.5 }]}>
                {packaging.name}
              </Text>
              <Text style={[styles.tableCell]}>{packaging.full_quantity}</Text>
              <Text style={styles.tableCell}>{packaging.empty_quantity}</Text>
              <Text style={styles.tableCell}>
                {packaging.empty_quantity + packaging.full_quantity}
              </Text>
              <Text style={styles.tableCell}>{Number(packaging.price)}</Text>
              <Text
                style={[styles.tableCell, { flex: 2, textAlign: "right" }]}
              >
                {formatteCurrency(
                  Number(packaging.price) *
                  (packaging.full_quantity + packaging.empty_quantity)
                )}
              </Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2.5 }]}>{t("pdf.total")}</Text>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              {packagings?.reduce(
                (acc, curr) => (acc += curr.full_quantity),
                0
              )}
            </Text>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              {packagings?.reduce(
                (acc, curr) => (acc += curr.empty_quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>
              {packagings?.reduce(
                (acc, curr) =>
                  (acc += curr.empty_quantity + curr.full_quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>
              {formatteCurrency(
                packagings.reduce((acc, curr) => {
                  return (acc +=
                    (curr.full_quantity +
                      curr.empty_quantity) * Number(curr.price));
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

StockPackagingsPDF.displayName = "StockPackagingsPDF";

export default StockPackagingsPDF;
