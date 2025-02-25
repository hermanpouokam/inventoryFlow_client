// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface InventoryPackagingState {
  packagingInventory: InventoryPackage[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: InventoryPackagingState = {
  packagingInventory: [],
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
export const fetchPackagingInventory = createAsyncThunk(
  "inventoryPackage/fetchPackagingInventory",
  async ({ sales_point, start_date, end_date, is_validated }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const params = {
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(is_validated ? { is_validated: is_validated } : {}),
    };
    const response = await instance.get("/package-inventory/list/", { params });
    return response.data;
  }
);

// Create a slice
const packagingInventories = createSlice({
  name: "packagingInventories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackagingInventory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPackagingInventory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.packagingInventory = action.payload;
      })
      .addCase(fetchPackagingInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default packagingInventories.reducer;
