// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface YourState {
  data: Bill[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: YourState = {
  data: [],
  status: "idle",
  error: null,
};
interface Params {
  customer?: number;
  start_date?: Date;
  end_date?: Date;
  sales_point?: number[];
  state?: string;
}
// Create an async thunk for fetching data
export const fetchBills = createAsyncThunk(
  "bills/fetchBills",
  async ({ sales_point, start_date, end_date, customer, state }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const params = {
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(customer ? { customer } : {}),
      ...(state ? { state } : {}),
    };
    const response = await instance.get("/bills/", { params });
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
      .addCase(fetchBills.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default billsSlicer.reducer;
