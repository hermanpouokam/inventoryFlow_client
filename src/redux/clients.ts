//@ts-nocheck
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface customerState {
  data: Customer[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: customerState = {
  data: [],
  status: "idle",
  error: null,
};
interface Params {
  categories?: number[];
  sales_points?: number[];
}

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async ({ sales_points, categories }: Params) => {
    const params = new URLSearchParams();
    sales_points?.forEach((sales_point, index) => {
      params.append(`sales_point`, sales_point);
    });
    categories?.forEach((category, index) => {
      params.append(`category`, category);
    });
    const response = await instance.get(`/clients/?${params.toString()}`); // Adjust endpoint as needed
    return response.data;
  }
);

const clientsSlicer = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default clientsSlicer.reducer;
