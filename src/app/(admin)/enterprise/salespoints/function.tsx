import { instance } from "@/components/fetch";

const createEmployee = async (data: any) => {
  try {
    const response = await instance.post(`/employees/`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const createTax = async (data: any) => {
  try {
    const response = await instance.post(`/taxes/`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export { createEmployee, createTax };
