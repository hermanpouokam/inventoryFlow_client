// redux/additionalFeesSlicer.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface additionalFeesState {
  additionalFees: AdditionalFee[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: additionalFeesState = {
  additionalFees: [],
  status: "idle",
  error: null,
};
interface Params {
  sales_point?: number[];
  is_active?: boolean;
}
// Create an async thunk for fetching data
export const fetchAdditionalFees = createAsyncThunk(
  "additionalFees/fetchAdditionalFees",
  async ({ sales_point, is_active }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const params = {
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(is_active ? { is_active: is_active } : {}),
    };
    const response = await instance.get("/additional-fees/", { params });
    return response.data;
  }
);

// Create a slice
const additionalFeesSlice = createSlice({
  name: "additionalFees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdditionalFees.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdditionalFees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.additionalFees = action.payload;
      })
      .addCase(fetchAdditionalFees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default additionalFeesSlice.reducer;