"use client";
import axios from "axios";
import SecureLS from "secure-ls";
import { startInactivityTracking } from "@/utils/inactivityTracker";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";

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
        const response = await instance.post(`/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        ls.set("accessToken", access);
        return instance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed:", err);
      }
    }
    return Promise.reject(error);
  }
);

// Token Management
export const storeToken = async (token: string) => ls.set("accessToken", token);
export const getToken = () => ls.get("accessToken");
export const storeRefreshToken = async (token: string) =>
  ls.set("refreshToken", token);
export const getRefreshToken = () => ls.get("refreshToken");
export const storeUserData = async (userData: any) =>
  ls.set("userData", userData);
export const getUserData = async () => ls.get("userData");

// Register User
export const registerUser = async ({
  name,
  surname,
  username,
  email,
  password,
  number,
  user_type,
  country,
}) => {
  try {
    const response = await instance.post(
      `/register-user/`,
      {
        name,
        surname,
        email,
        password,
        username,
        number,
        user_type,
        country,
      },
      { withCredentials: true }
    );
    await storeToken(response.data.access);
    await storeRefreshToken(response.data.refresh);
    await storeUserData(response.data.user);
    return response.data;
  } catch (error) {
    console.log(
      "User registration failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Register Enterprise
export const registerEnterprise = async ({
  name,
  address,
  phone,
  email,
  plan_id,
}: {
  name: string;
  address: string;
  phone?: string;
  email: string;
  plan_id: number;
}) => {
  try {
    const response = await instance.post(
      `/register-enterprise/`,
      {
        name,
        address,
        phone,
        email,
        plan_id,
        details: { balance: 0 },
      },
      { withCredentials: true }
    );
    // await storeToken(response.data.access);
    // await storeRefreshToken(response.data.refresh);
    // await storeUserData(response.data.user);
    return response.data;
  } catch (error) {
    console.error(
      "Enterprise registration failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Login
export const login = async ({ username, password }) => {
  try {
    const response = await instance.post(`/token/`, {
      username,
      password,
    });
    await storeToken(response.data.access);
    await storeRefreshToken(response.data.refresh);
    await storeUserData(response.data.user);
    return response.data;
  } catch (error) {
    // console.log(error);
    // console.error("Login failed: ", error);
    throw error;
  }
};

export const selectPlan = (plan: Plan) => {
  return instance.post(`/select-plan/`, {
    plan: plan.id,
    amount: parseInt(plan.price),
    payment_method: "carte",
    next_due_date: new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    ).toISOString(),
  });
};

// Logout
export const logoutUser = async () => {
  try {
    await instance.post(`/logout/`, {}, { withCredentials: true });
    ls.removeAll();
    window.location.href = "/signin";
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
};

// Setup Authentication
// export const setupAuth = () => {
//     startInactivityTracking(() => {
//         logoutUser(); // Automatically log out after inactivity
//     });
// };

// Refresh Token
export const refreshToken = async () => {
  try {
    const response = await instance.post(`/token/refresh/`, {
      refresh: getRefreshToken(),
    });
    await storeToken(response.data.access);
  } catch (error) {
    console.error(
      "Token refresh failed:",
      error.response?.data || error.message
    );
    // Handle token refresh failure, e.g., redirect to login page
    window.history.pushState({}, "", "/signin");
  }
};

// Get Plans
export const getPlans = async (id = 0) => {
  try {
    const response = await instance.get(`/plans/${id != 0 ? id + "/" : ""}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching plans:",
      error.response?.data || error.message
    );
    throw error;
  }
};

