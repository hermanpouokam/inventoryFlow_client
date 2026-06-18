import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface State {
  data: Supplier[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: State = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async ({ sales_points_id }: { sales_points_id?: number[] }) => {
    const salesPointsParam = sales_points_id?.join(",");

    const response = await instance.get("/suppliers/", {
      params: {
        sales_points: salesPointsParam,
      },
      withCredentials: true,
    });
    return response.data;
  }
);

const suppliersSlicer = createSlice({
  name: "suppliers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default suppliersSlicer.reducer;
