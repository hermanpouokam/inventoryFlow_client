// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProductCatState {
  data: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: ProductCatState = {
  data: [],
  status: "idle",
  error: null,
};

// Create an async thunk for fetching fetchClientCat
export const fetchProductsCat = createAsyncThunk(
  "productsCat/fetchProductsCat",
  async ({ sales_points_id }: { sales_points_id?: number[] }) => {
    const salesPointsParam = sales_points_id?.join(",");

    const response = await instance.get("/categories/", {
      params: {
        ...(sales_points_id ? { sales_points: salesPointsParam } : {}),
      },
    });
    return response.data;
  }
);

// Create a slice
const productsCatSlicer = createSlice({
  name: "productsCat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsCat.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProductsCat.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchProductsCat.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default productsCatSlicer.reducer;
