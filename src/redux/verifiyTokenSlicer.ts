// redux/yourSlice.ts
import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface State {
  data: SalesPoint[];
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: State = {
  data: [],
  status: "idle",
  error: null,
  isAuthenticated: false,
};

// Create an async thunk for fetching data
export const fetchSalesPoints = createAsyncThunk(
  "salesPoints/fetchSalesPoints",
  async () => {
    const response = await instance.get("/verify-token/", {
      withCredentials: true,
    }); // Adjust endpoint as needed
    return response.data;
  }
);

// Create a slice
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
