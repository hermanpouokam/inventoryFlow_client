"use client";
import SecureLS from "secure-ls";
import { instance } from "./fetch"; 

// Initialisation conditionnelle côté client
let ls: SecureLS | null = null;

if (typeof window !== "undefined") {
  ls = new SecureLS({
    encodingType: "aes",
    encryptionSecret: "interact-app",
  });
}

// Token Management
export const storeToken = async (token: string) => {
  if (ls) ls.set("accessToken", token);
};
export const getToken = () => (ls ? ls.get("accessToken") : null);

export const storeRefreshToken = async (token: string) => {
  if (ls) ls.set("refreshToken", token);
};
export const getRefreshToken = () => (ls ? ls.get("refreshToken") : null);

export const storeUserData = async (userData: any) => {
  if (ls) ls.set("userData", userData);
};
export const getUserData = async () => (ls ? ls.get("userData") : null);

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

