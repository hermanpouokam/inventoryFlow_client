// redux/yourSlice.ts
import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface YourState {
  data: Employee[];
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
  sales_point?: number;
}
// Create an async thunk for fetching data
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async ({ sales_point }: Params) => {
    const params = {
      ...(sales_point ? { sales_point } : {}),
    };
    const response = await instance.get("/employees/", { params }); // Adjust endpoint as needed
    return response.data;
  }
);

// Create a slice
const employeesSlicer = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default employeesSlicer.reducer;
