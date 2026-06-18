"use client";
import axios, { AxiosError, AxiosResponse } from "axios";
import SecureLS from "secure-ls";
import API_URL from "@/config";

// Vérifier si on est côté client avant d'initialiser SecureLS
let ls: SecureLS | null = null;

if (typeof window !== "undefined") {
  ls = new SecureLS({
    encodingType: "aes",
    encryptionSecret: "interact-app",
  });
}

// Créer une instance Axios
export const instance = axios.create({
  baseURL: API_URL,
  // timeout: 2500,
});

// Intercepteur de requêtes
instance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && ls) {
      const token = ls.get("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window !== "undefined" && ls) {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = ls.get("refreshToken");
          if (!refreshToken) throw new Error("No refresh token found");

          const response = await instance.post(`/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          ls.set("accessToken", access);
          originalRequest.headers["Authorization"] = `Bearer ${access}`;

          return instance(originalRequest);
        } catch (err) {
          console.error("Refresh token failed:", err);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getAllProducts = async () => {
  try {
    const response = await instance.get("/user-products/");
    return response.data;
  } catch (error) {
    console.error("Error fetching user products:", error);
    throw error;
  }
};

export const getUserCustomers = async () => {
  try {
    const response = await instance.get("/user-customers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching user customers:", error);
    throw error;
  }
};

export const getAllSellPrices = async () => {
  try {
    const response = await instance.get("/sell-prices/");
    return response.data;
  } catch (error) {
    //@ts-ignore
    console.error(
      "Error fetching sell prices:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createSellPrice = async (sellPriceData: any) => {
  try {
    const response = await instance.post("/sell-prices/", sellPriceData);
    return response.data;
  } catch (error) {
    //@ts-ignore
    console.error(
      "Error creating sell price:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateSellPrice = async (id: number, sellPriceData: SellPrice) => {
  try {
    const response = await instance.put(`/sell-prices/${id}/`, sellPriceData);
    return response.data;
  } catch (error) {
    //@ts-ignore
    console.error(
      "Error updating sell price:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteSellPrice = async (id: number) => {
  try {
    const response = await instance.delete(`/sell-prices/${id}/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    //@ts-ignore
    console.error(
      "Error deleting sell price:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createBill = async (billData: any) => {
  try {
    const response = await instance.post("/create-bill/", billData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
};

export async function updateBill(billData: Bill, billId: number) {
  try {
    const response = await instance.put(`/bills/${billId}/`, billData);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating bill:",
      error.response ? error.response.data : error.message
    );
  }
}

export const updateDeliverer = async (
  billId?: number,
  delivererId?: number
) => {
  try {
    const response = await instance.put(
      `/bills/${billId}/update-deliverer/`,
      {
        deliverer: delivererId,
        state: "pending",
      },
      { withCredentials: true }
    );
    return response;
  } catch (error: AxiosError) {
    if (error.response) {
      console.error("Error updating deliverer:", error.response.data);
    } else if (error.request) {
      console.error("Error updating deliverer: No response received");
    } else {
      console.error("Error updating deliverer:", error.message);
    }
    throw error
  }
};

export const updatePaid = async (amount: number, billId: number) => {
  try {
    const response = await instance.put(
      `bills/${billId}/update-delivered/`,
      {
        amount,
      },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    if (error.response) {
      console.error("Error updating deliverer:", error.response.data);
    } else if (error.request) {
      console.error("Error updating deliverer: No response received");
    } else {
      console.error("Error updating deliverer:", error.message);
    }
    throw error
  }
};

export const createProduct = async (product: Product) => {
  try {
    const res = await instance.post("/products/", { ...product });
    return res;
  } catch (error) {
    if (error.response) {
      console.error("Error updating deliverer:", error.response.data);
    } else if (error.request) {
      console.error("Error updating deliverer: No response received");
    } else {
      console.error("Error updating deliverer:", error.message);
    }
  }
};

export const createProductCat = async (category: Category) => {
  try {
    const res = await instance.post("/categories/", { ...category });
    return res.data;
  } catch (error) {
    if (error.response) {
      console.error("Error updating deliverer:", error.response.data);
    } else if (error.request) {
      console.error("Error updating deliverer: No response received");
    } else {
      console.error("Error updating deliverer:", error.message);
    }
  }
};

export const createPackaging = async (packaging: any) => {
  try {
    const res = await instance.post("/packagings/", { ...packaging });
    return res;
  } catch (error) {
    if (error.response) {
      return error;
    } else if (error.request) {
      throw new Error("Error creatting packaging");
    } else {
      console.error("Error creating packaging:", error.message);
    }
  }
};

export const createSalesPoint = async (salesPoint: any) => {
  try {
    const response = await instance.post<AxiosResponse<SalesPoint[]>>(
      "/sales-points/",
      { ...salesPoint }
    );
    return response;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
      throw new Error("Error creatting salespoint");
    } else {
      console.error("Error creating salespoint:", error.message);
    }
  }
};

export const createSupply = async (supplyData: any) => {
  try {
    const response = await instance.post<AxiosResponse<Supply[]>>(
      "/supplies/",
      supplyData,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating supply:", error);
    throw error;
  }
};
