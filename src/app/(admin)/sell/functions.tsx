"use client";
import { instance } from "@/components/fetch";

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
