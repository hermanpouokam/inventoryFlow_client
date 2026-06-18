import React from "react";
import i18n from "i18next";
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
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  bottomText: {
    position: "absolute",
    bottom: 9,
    textAlign: "center",
    fontSize: 8,
    color: "#5f5f5f",
  },
});

interface InventoryPDFProps {
  inventory: Inventory;
  title: string;
}

const InventoryPDF: React.FC<InventoryPDFProps> = ({ inventory, title }) => {
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
            {inventory.sales_point_details?.name}
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
              {t("pdf.address")}: {inventory.sales_point_details?.address ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9 }}>
              {t("pdf.phone")}: {inventory.sales_point_details?.number ?? "N/A"}
            </Text>
            <Text style={{ fontSize: 9 }}>
              {t("pdf.email")}: {inventory.sales_point_details?.email ?? "N/A"}
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

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width:'100%'
          }}
        >
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.subtitle}>
              {t("inventory.columns.inventory_number")}: {inventory?.inventory_number}
            </Text>
            <Text style={styles.subtitle}>
              {t("bills.columns.status")}: {inventory.is_validated ? t("status_filter.validated") : t("status_filter.not_validated")}
            </Text>
            {inventory.is_validated && (
              <>
                <Text style={styles.subtitle}>
                  {t("inventory.columns.validated_by")}: {inventory?.validated_by_name}
                </Text>
                <Text style={styles.subtitle}>
                  {t("inventory.columns.validated_at")}:{new Date(inventory?.created_at).toLocaleString()}
                </Text>
              </>
            )}
          </View>
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.subtitle}>
              {t("pdf.created_by")}: {inventory?.created_by_name}
            </Text>
            <Text style={styles.subtitle}>
              {/* @ts-ignore */}
              {t("pdf.created_on")}: {new Date(inventory?.created_at).toLocaleString()}
            </Text>
            <Text style={styles.subtitle}>
              {t("pdf.printed_on")}: {new Date().toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={[styles.table, { borderWidth: 2 }]}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>{t("bills.columns.code")}</Text>
            <Text style={[styles.tableCell, { flex: 2.5 }]}>{t("article")}</Text>
            <Text style={styles.tableCell}>{t("inventory.columns.previous_quantity")}</Text>
            <Text style={[styles.tableCell]}>{t("inventory.columns.new_quantity")}</Text>
            <Text style={styles.tableCell}>{t("inventory.columns.difference")}</Text>
          </View>
          {inventory.inventory_products?.map((pr, index) => {
            const product = pr.product_details;
            const diff = pr.new_quantity - pr.old_quantity;
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{product.product_code}</Text>
                <Text style={[styles.tableCell, { flex: 2.5 }]}>
                  {product.name}
                </Text>
                <Text style={styles.tableCell}>{pr.old_quantity}</Text>
                <Text style={styles.tableCell}>{pr.new_quantity}</Text>
                <Text style={styles.tableCell}>{diff}</Text>
              </View>
            );
          })}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}></Text>
            <Text style={[styles.tableCell, { fontWeight: "bold", flex: 2.5 }]}>
              {t("total")}
            </Text>
            <Text style={styles.tableCell}>
              {inventory.inventory_products?.reduce(
                (acc, curr) => (acc += curr.old_quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>
              {inventory.inventory_products?.reduce(
                (acc, curr) => (acc += curr.new_quantity),
                0
              )}
            </Text>
            <Text style={styles.tableCell}>
              {inventory.inventory_products?.reduce(
                (acc, curr) => (acc += curr.new_quantity - curr.old_quantity),
                0
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

InventoryPDF.displayName = "StockPDF";

export default InventoryPDF;
