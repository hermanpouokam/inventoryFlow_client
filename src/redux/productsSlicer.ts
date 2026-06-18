//@ts-nocheck
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProductsState {
  data: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: ProductsState = {
  data: [],
  status: "idle",
  error: null,
};
interface Params {
  sales_points?: number[];
  categories?: number[];
  suppliers?: number[];
}

// Create an async thunk for fetching data
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ sales_points, categories, suppliers }: Params) => {
    const params = new URLSearchParams();
    sales_points?.forEach((sales_point, index) => {
      params.append(`sales_point`, sales_point);
    });
    categories?.forEach((category, index) => {
      params.append(`category`, category);
    });
    suppliers?.forEach((supplier, index) => {
      params.append(`supplier`, supplier);
    });
    const query = params.toString();

    const response = await instance.get(`/products-list/?${query.toString()}`); // Adjust endpoint as needed
    return response.data;
  }
);

// Create a slice
const productsSlicer = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default productsSlicer.reducer;
