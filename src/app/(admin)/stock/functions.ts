import { instance } from "@/components/fetch";

function calculateTotalAmount(products: Product[]) {
  return products.reduce((total, product) => {
    const price = parseFloat(product.price);
    const amount = product.total_quantity * price;
    return total + amount;
  }, 0);
}

const formatteCurrency = (
  amount: number | string,
  currency: string = "XAF",
  locale: string = "fr-FR"
) => {
  const formatted = new Intl.NumberFormat(locale, {
    currency,
    style: "currency",
  }).format(Number(amount)).replace(/\u202F/g, " ")
    .trim();

  return formatted;
};

const createSupplier = async (params: {
  name: string;
  address?: string;
  contact?: string;
  email?: string;
  sales_point: number;
}) => {
  const res = await instance.post(`/suppliers/`, params, {
    withCredentials: true,
  });
  return res;
};

const createVariant = async (params: {
  name: string;
  quantity: string;
  product: string;
}) => {
  const res = await instance.post(`/variants/`, params, {
    withCredentials: true,
  });
  return res;
};

function formatNumber(number: number) {
  if (!Number.isFinite(number)) return "Invalid number";

  const hasDecimals = number % 1 !== 0; // Vérifie si le nombre a des décimales
  const decimals = hasDecimals ? number.toString().split(".")[1].length : 0;

  return number
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export {
  calculateTotalAmount,
  formatteCurrency,
  createSupplier,
  createVariant,
  formatNumber
};
