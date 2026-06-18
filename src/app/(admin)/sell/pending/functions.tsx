import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

export const transformProductBills = (productsBill: ProductBill[]) => {
  let newArray = [];
  productsBill.forEach((productBill: ProductBill, i) => {
    const InvoiceProduct: InvoiceProduct = {
      article: productBill.product_details.name,
      code: productBill.product_details.product_code,
      id: productBill.product,
      number: i + 1,
      sellPrice: productBill.price,
      sell_price: productBill.sell_price,
      quantity: productBill.quantity,
      total: productBill.total_amount,
      variant_id: productBill.product_details.id,
      price: productBill?.product_details.price,
      is_variant: productBill.is_variant,
      is_beer: productBill.product_details.is_beer,
      recorded_packaging: productBill.product_details.is_beer ? productBill.package_product_bill?.record : 0,
      
    };
    newArray.push(InvoiceProduct);
  });
  return newArray;
};

export const getDatesData = (t: any): { name: string; value: DateRange }[] => {
  return [
    {
      name: t("dashboard.date_presets.today"),
      value: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      name: t("dashboard.date_presets.yesterday"),
      value: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      name: t("dashboard.date_presets.this_week"),
      value: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      name: t("dashboard.date_presets.this_month"),
      value: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
    {
      name: t("dashboard.date_presets.last_month"),
      value: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      },
    },
    {
      name: t("dashboard.date_presets.this_year"),
      value: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
    },
    {
      name: t("dashboard.date_presets.last_year"),
      value: {
        from: new Date(new Date().getFullYear() - 1, 0, 1),
        to: new Date(new Date().getFullYear() - 1, 11, 31),
      },
    },
  ];
};