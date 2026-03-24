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

const getRoles = async () => {
  try {
    const response = await instance.get(`/roles/`, {
      withCredentials: true
    })
    return response.data as Role[]
  } catch (error) {
    throw error;
  }
}

const getActionsPermissions = async () => {
  try {
    const response = await instance.get(`/action-permission/`, {
      withCredentials: true
    })
    return response.data as ActionPermission[]
  } catch (error) {
    throw error;
  }
}

const getPermissions = async () => {
  try {
    const response = await instance.get(`/permissions/`, {
      withCredentials: true
    })
    return response.data as Permission[]
  } catch (error) {
    throw error;
  }
}

export const registerEmployee = async ({
  name,
  surname,
  username,
  email,
  password,
  number,
  user_type,
  country,
  role,
  sales_point,
  permission_ids,
  action_permission_ids,
}) => {
  try {
    const response = await instance.post(
      `/register-employee/`,
      {
        name,
        surname,
        email,
        password,
        username,
        number,
        user_type,
        country,
        sales_point,
        role,
        permission_ids,
        action_permission_ids,
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    // console.log(
    //   "User registration failed:",
    //   error.response?.data || error.message
    // );
    throw error;
  }
};

const addPagePermissions = async (id: number, ids?: number[]) => {
  try {
    const response = await instance.post(`/users/${id}/permissions/`, {
      permission_ids: ids
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

const addActionPermissions = async (id: number, ids?: number[]) => {
  try {
    const response = await instance.post(`/users/${id}/action-permissions/`, {
      permission_ids: ids
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
export {
  createEmployee, createTax, getRoles, getActionsPermissions,
  getPermissions, addActionPermissions, addPagePermissions
};
