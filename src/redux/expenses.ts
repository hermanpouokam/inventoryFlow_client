// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface expensesState {
  expenses: Expense[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: expensesState = {
  expenses: [],
  status: "idle",
  error: null,
};
interface Params {
  start_date?: string;
  end_date?: string;
  sales_point?: number[];
  is_validated?: boolean;
}
// Create an async thunk for fetching data
export const  fetchExpenses = createAsyncThunk(
  "expense/fetchExpenses",
  async ({ sales_point, start_date, end_date, is_validated }: Params) => {
    const salesPointsParam = sales_point?.join(",");
    const params = {
      ...(start_date ? { start_date } : {}),
      ...(end_date ? { end_date } : {}),
      ...(sales_point ? { sales_points: salesPointsParam } : {}),
      ...(is_validated ? { is_validated: is_validated } : {}),
    };
    const response = await instance.get("/expenses-list/", { params });
    return response.data;
  }
);

// Create a slice
const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default expenseSlice.reducer;
