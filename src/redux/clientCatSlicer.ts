// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface CustomerState {
  data: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: CustomerState = {
  data: [],
  status: "idle",
  error: null,
};

interface Params {
  sales_points?: number[];
}

// Create an async thunk for fetching fetchClientCat
export const fetchClientCat = createAsyncThunk(
  "clientCat/fetchClientCat",
  async ({ sales_points }: Params) => {
    const salesPointsParam = sales_points?.join(",");
    const response = await instance.get("/client-categories/", {
      params: {
        ...(sales_points ? { sales_points: salesPointsParam } : {}),
      },
    });
    return response.data;
  }
);

// Create a slice
const clientCatSlicer = createSlice({
  name: "clientCat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientCat.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchClientCat.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchClientCat.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default clientCatSlicer.reducer;
