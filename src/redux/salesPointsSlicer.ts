import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface State {
  data: SalesPoint[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: State = {
  data: [],
  status: "idle",
  error: null,
};

// Create an async thunk for fetching data
export const fetchSalesPoints = createAsyncThunk(
  "salesPoints/fetchSalesPoints",
  async () => {
    // const params = new URLSearchParams();
    // const salesPointsParam = sales_points?.join(",");
    // params.append(`sales_points`, salesPointsParam?.toString());
    // const query = params.toString();
    const response = await instance.get(`/sales-points-list/`, {
      withCredentials: true
    });
    return response.data;
  }
);

const salesPointsSlicer = createSlice({
  name: "salesPoints",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesPoints.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSalesPoints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchSalesPoints.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default salesPointsSlicer.reducer;
