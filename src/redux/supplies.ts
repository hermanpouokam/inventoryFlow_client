// redux/yourSlice.ts
import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface SupplyState {
  supplies: Supply[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: SupplyState = {
  supplies: [],
  status: "idle",
  error: null,
};
interface Params {
  start_date?: string;
  end_date?: string;
  sales_point?: number[];
  suppliers?: number[];
}
// Create an async thunk for fetching data
export const fetchSupplies = createAsyncThunk(
  "supplies/fetchSupplies",
  async ({ sales_point, start_date, end_date, suppliers }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const suppliersParam = suppliers?.join(",");
    const params = {
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(suppliers ? { suppliers: suppliersParam } : {}),
    };
    const response = await instance.get("/supplies/", { params });
    return response.data;
  }
);

// Create a slice
const billsSlicer = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplies.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSupplies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.supplies = action.payload;
      })
      .addCase(fetchSupplies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default billsSlicer.reducer;
