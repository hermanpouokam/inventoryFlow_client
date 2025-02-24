// redux/yourSlice.ts
import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface InventoryState {
  inventories: Inventory[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: InventoryState = {
  inventories: [],
  status: "idle",
  error: null,
};
interface Params {
  start_date?: string;
  end_date?: string;
  sales_point?: number[];
  is_validated?: boolean;
}
// Create an async thunk for fetching data
export const fetchInventories = createAsyncThunk(
  "inventory/fetchInventories",
  async ({ sales_point, start_date, end_date, is_validated }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const params = {
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(is_validated ? { is_validated: is_validated } : {}),
    };
    const response = await instance.get("/inventories/", { params });
    return response.data;
  }
);

// Create a slice
const inventoriesSerializer = createSlice({
  name: "inventories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInventories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.inventories = action.payload;
      })
      .addCase(fetchInventories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default inventoriesSerializer.reducer;
