// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface taxesState {
  taxes: Tax[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: taxesState = {
  taxes: [],
  status: "idle",
  error: null,
};
interface Params {
  sales_point?: number[];
  is_active?: boolean;
}
// Create an async thunk for fetching data
export const fetchTaxes = createAsyncThunk(
  "taxes/fetchTaxes",
  async ({ sales_point, is_active }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const params = {
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(is_active ? { is_active: is_active } : {}),
    };
    const response = await instance.get("/taxes/", { params });
    return response.data;
  }
);

// Create a slice
const taxesSlice = createSlice({
  name: "taxes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTaxes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.taxes = action.payload;
      })
      .addCase(fetchTaxes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default taxesSlice.reducer;
