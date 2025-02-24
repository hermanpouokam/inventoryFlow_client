export function transformVariants(products: Product[]) {
  const transformedProducts: ProductVariant[] = [];
  products.forEach((product) => {
    if (product?.with_variant) {
      if (product.variants.length > 0) {
        product?.variants.forEach((variant) => {
          const transformedVariant = {
            id: product.id,
            variant_id: variant.id,
            product_id: product.id,
            name: `${product.name} - ${variant.name}`,
            product_code: product.product_code,
            quantity: variant.quantity,
            created_at: product.created_at,
            last_update: product.last_update,
            category: product.category,
            supplier: product.supplier,
            sell_prices: product.sell_prices,
            price: product.price,
            is_beer: product.is_beer,
            enterprise: product.enterprise,
            is_variant: true,
          };
          transformedProducts.push(transformedVariant);
        });
      }
    } else {
      transformedProducts.push({ ...product, product_id: product.id });
    }
  });

  return transformedProducts;
}
