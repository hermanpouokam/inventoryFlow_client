import { instance } from "@/components/fetch";
import { AxiosResponse } from "axios";

interface inventoryData {
  sales_point: number;
  products: { product: number; new_quantity: number; variant?: number }[];
}

const createInventory = async (data: inventoryData) => {
  try {
    const response = await instance.post<AxiosResponse<Inventory[]>>(
      `/inventories/create/`,
      data,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const validateInventory = async (id: number) => {
  try {
    const response = await instance.put<AxiosResponse<Inventory[]>>(
      `/inventory/${id}/validate/`,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteInventory = async (id: number) => {
  try {
    const response = await instance.delete(`/delete-inventory/${id}/`);
    return response;
  } catch (error) {
    throw error;
  }
};

const createEmptyPackagingInventory = async (data: any) => {
  try {
    const response = await instance.post(`/inventory/packaging/create/`, data, {
      withCredentials: true,
    });
    console.log("Inventaire créé avec succès:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Erreur lors de la création:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const validateInventoryPackage = async (id: number) => {
  try {
    const response = await instance.put<AxiosResponse<Inventory[]>>(
      `/inventory/empty-packaging/validate/${id}/`,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteInventoryPackage = async (id: number) => {
  try {
    const response = await instance.delete(
      `inventory/empty-packaging/delete/${id}/`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export {
  createInventory,
  validateInventory,
  deleteInventory,
  createEmptyPackagingInventory,
  deleteInventoryPackage,
  validateInventoryPackage,
};
