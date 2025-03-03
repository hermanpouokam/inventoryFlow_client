// 'use client'
// export const dynamic = "force-dynamic";

// import React from "react";
// import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
// import moment from "moment";
// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//     fontFamily: "Helvetica",
//     display: "flex",
//     alignItems: "center",
//   },
//   tableContainer: {
//     border: 1.5,
//     borderColor: "#000",
//   },
//   section: {
//     marginBottom: 20,
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     padding: 0,
//     margin: 0,
//     borderTop: 1,
//   },
//   tableCell: {
//     paddingVertical: 7,
//     paddingHorizontal: 5,
//     display: "flex",
//     textAlign: "left",
//     margin: 0,
//     fontSize: 12,
//     borderRightWidth: 1,
//     borderColor: "#000",
//   },
//   header: {
//     borderBottom: 2,
//     // borderTop: 2,
//     width: "100%",
//     borderStyle: "solid",
//   },
//   cellText: {
//     fontSize: 9,
//   },
//   tableRow: {
//     flexDirection: "row",
//     width: "100%",
//     borderTop: 1,
//   },
//   bottomText: {
//     position: "absolute",
//     bottom: 9,
//     textAlign: "center",
//     fontSize: 8,
//     color: "#5f5f5f",
//   },
// });

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

// const BuyRoadmap: React.FC<GroupedDataPDFProps> = ({
//   groupedData,
//   title,
//   salespoint,
// }) => {
//   const listAllProducts = (groupedData: GroupedData) => {
//     const products: { [productId: string]: string } = {};
//     Object.values(groupedData).forEach((customer) => {
//       Object.entries(customer.total_products).forEach(
//         ([productId, productDetails]) => {
//           if (!products[productId]) {
//             products[productId] = productDetails.product_name;
//           }
//         }
//       );
//     });
//     return products;
//   };

//   //   const allProducts = listAllProducts(groupedData);
//   //   const productArray = Object.entries(allProducts).map(([id, name]) => ({
//   //     id,
//   //     name,
//   //   }));

//   return (
//     <Document>
//       <Page
//         size={"A4"}
//         //@ts-ignore
//         style={styles.page}
//       >
//         <View
//           style={{
//             marginBottom: 25,
//             border: 2,
//             width: "100%",
//             borderStyle: "dashed",
//             paddingVertical: 10,
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 25,
//               textAlign: "center",
//             }}
//           >
//             {salespoint?.name}
//           </Text>
//           <View
//             style={{
//               display: "flex",
//               flexDirection: "row",
//               justifyContent: "space-evenly",
//               alignItems: "center",
//               marginTop: 5,
//             }}
//           >
//             <Text style={{ fontSize: 9 }}>
//               Adresse: {salespoint?.address ?? "N/A"}
//             </Text>
//             <Text style={{ fontSize: 9 }}>
//               Numéro: {salespoint?.number ?? "N/A"}
//             </Text>
//             <Text style={{ fontSize: 9 }}>
//               Email: {salespoint?.email ?? "N/A"}
//             </Text>
//           </View>
//         </View>
//         <Text
//           style={{
//             width: "100%",
//             fontSize: 15,
//             marginBottom: 10,
//             textAlign: "center",
//             textDecoration: "underline",
//             color: "#e74c3c",
//           }}
//         >
//           {title}
//         </Text>
//         <>
//           {Object.entries(groupedData).map(([key, value], index) => (
//             <View
//               style={{
//                 marginBottom: 10,
//                 width: "100%",
//                 border: 2,
//                 borderColor: "#000",
//                 borderStyle: "solid",
//                 padding: 0,
//               }}
//             >
//               <View
//                 style={[
//                   styles.header,
//                   {
//                     borderStyle: "solid",
//                     padding: 5,
//                     backgroundColor: "rgba(0,0,0,.2)",
//                     borderBottom: 0,
//                   },
//                 ]}
//               >
//                 <Text style={{ textAlign: "center" }}>{key}</Text>
//               </View>
//               {Object.entries(value).map(([cat, catValue], index) => (
//                 <>
//                   <View
//                     style={[
//                       styles.header,
//                       {
//                         borderStyle: "solid",
//                         padding: 3,
//                         borderTop: 2,
//                         fontSize: 15,
//                         margin: 0,
//                       },
//                     ]}
//                   >
//                     <Text style={{ textAlign: "center" }}>{cat}</Text>
//                   </View>
//                   <>
//                     {Object.entries(catValue).map(
//                       ([productKey, product], index) => (
//                         <View
//                           style={[
//                             styles.tableRow,
//                             { borderTop: index == 0 ? 0 : 1 },
//                           ]}
//                           key={index}
//                         >
//                           <Text style={[styles.tableCell]}>{index + 1}</Text>
//                           <Text style={[styles.tableCell, { width: "30%" }]}>
//                             {product.code}
//                           </Text>
//                           <Text style={[styles.tableCell, { width: "55%" }]}>
//                             {productKey}
//                           </Text>
//                           <Text
//                             style={[
//                               styles.tableCell,
//                               {
//                                 borderRight: 0,
//                                 textAlign: "right",
//                                 width: "15%",
//                               },
//                             ]}
//                           >
//                             {product.quantity}
//                           </Text>
//                         </View>
//                       )
//                     )}
//                     <View
//                       style={[
//                         styles.tableRow,
//                         // { borderTop: index == 0 ? 0 : 1 },
//                       ]}
//                       key={index}
//                     >
//                       <Text
//                         style={[
//                           styles.tableCell,
//                           { width: "85.5%", textAlign: "right" },
//                         ]}
//                       >
//                         Total
//                       </Text>
//                       <Text
//                         style={[
//                           styles.tableCell,
//                           {
//                             borderRight: 0,
//                             textAlign: "right",
//                             width: "14.5%",
//                           },
//                         ]}
//                       >
//                         {Object.values(catValue).reduce((acc, curr) => {
//                           return acc + curr.quantity;
//                         }, 0)}
//                       </Text>
//                     </View>
//                   </>
//                 </>
//               ))}
//             </View>
//           ))}
//         </>
//         <Text
//           style={[styles.bottomText, { left: 5 }]}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} sur ${totalPages}`
//           }
//           fixed
//         />
//         <Text style={[styles.bottomText, { left: 0, right: 0 }]} fixed>
//           © 2025 InventoryFlow by Interact | Tous droits reservés.
//         </Text>
//         <Text style={[styles.bottomText, { right: 5 }]} fixed>
//           {moment().format("DD/MM/YYYY hh:mm:ss")}
//         </Text>
//       </Page>
//     </Document>
//   );
// };

// BuyRoadmap.displayName = "BuyRoadmap";

// export default BuyRoadmap;

"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import moment from "moment";

const BuyRoadmap: React.FC<GroupedDataPDFProps> = ({
  groupedData,
  title,
  salespoint,
}) => {
  const [ReactPDF, setReactPDF] = useState<any>(null);

  useEffect(() => {
    // Charger dynamiquement @react-pdf/renderer
    import("@react-pdf/renderer").then((module) => {
      setReactPDF(module);
    });
  }, []);

  if (!ReactPDF) {
    return <div>Loading PDF renderer...</div>;
  }

  const { Page, Text, View, Document, StyleSheet } = ReactPDF;

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

  return (
    <Document>
      <Page size={"A4"} style={styles.page}>
        <View
          style={{
            marginBottom: 25,
            border: 2,
            width: "100%",
            borderStyle: "dashed",
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 25, textAlign: "center" }}>
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
        <>
          {Object.entries(groupedData).map(([key, value], index) => (
            <View
              style={{
                marginBottom: 10,
                width: "100%",
                border: 2,
                borderColor: "#000",
                borderStyle: "solid",
                padding: 0,
              }}
              key={index}
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
                <React.Fragment key={index}>
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
                            {product.code}
                          </Text>
                          <Text style={[styles.tableCell, { width: "55%" }]}>
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
                            {product.quantity}
                          </Text>
                        </View>
                      )
                    )}
                    <View style={styles.tableRow} key={index}>
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
                </React.Fragment>
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
