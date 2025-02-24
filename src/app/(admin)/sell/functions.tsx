"use client";
import axios, { AxiosResponse } from "axios";
import SecureLS from "secure-ls";

// Initialize SecureLS
const ls = new SecureLS({
  encodingType: "aes",
  encryptionSecret: "interact-app",
});

// Create Axios instance
export const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  // timeout: 2500,
});

// Request Interceptor
instance.interceptors.request.use(
  (config) => {
    const token = ls.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = ls.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const response = await instance.post(`/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        ls.set("accessToken", access);
        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return instance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed:", err);
        // Redirect to login or handle logout
      }
    }
    return Promise.reject(error);
  }
);

export const getBill = async (params: {
  customer: number[];
  start_date: string;
  end_date: string;
  sales_point: number[];
}) => {
  try {
    const response = await instance.get(`/bills/`, {
      params: {
        customer: params.customer.join(","),
        start_date: params.start_date,
        end_date: params.end_date,
        sales_points: params?.sales_point.join(","),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
};

export const getSupplies = async (params: {
  start_date?: string;
  end_date?: string;
  sales_point?: SalesPoint[];
  suppliers?: Supplier[];
}) => {
  try {
    const response = await instance.get(`/supplies/`, {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        ...(params.sales_point
          ? { sales_points: params?.sales_point.map((el) => el.id).join(",") }
          : {}),
        ...(params.suppliers
          ? { suppliers: params?.suppliers.map((el) => el.id).join(",") }
          : {}),
        // state: "created",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
};

export const deleteBill = async (params: { billId: number }) => {
  try {
    const response = await instance.delete(`/bills/${params.billId}/`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error deleting bill:", error);
    throw error;
  }
};

export const deleteSupplier = async (id: number) => {
  try {
    const response = await instance.delete(`/suppliers/${id}/`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
};
