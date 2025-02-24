//@ts-nocheck
import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface PackagingsState {
  data: Packaging[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: PackagingsState = {
  data: [],
  status: "idle",
  error: null,
};

interface Params {
  sales_points?: number[];
  suppliers?: number[];
}

// Create an async thunk for fetching data
export const fetchPackagings = createAsyncThunk(
  "packagings/fetchPackagings",
  async ({ sales_points, suppliers }: Params) => {
    const params = new URLSearchParams();
    sales_points?.forEach((sales_point, index) => {
      params.append(`sales_point`, sales_point);
    });
    suppliers?.forEach((supplier, index) => {
      params.append(`supplier`, supplier);
    });
    const query = params.toString();
    const response = await instance.get(`/packagings/?${query.toString()}`);
    return response.data;
  }
);

// Create a slice
const packagingsSlicer = createSlice({
  name: "packagings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackagings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPackagings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchPackagings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default packagingsSlicer.reducer;
