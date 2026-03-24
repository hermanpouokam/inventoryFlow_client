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
