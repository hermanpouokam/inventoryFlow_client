// redux/yourSlice.ts
import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface YourState {
    bill: Bill | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

// Initial state
const initialState: YourState = {
    bill: null,
    status: "idle",
    error: null,
};
interface Params {
    billId: number
}
// Create an async thunk for fetching data
export const fetchBill = createAsyncThunk(
    "bill/fetchBill",
    async ({ billId }: Params) => {
        const response = await instance.get(`/bills/${billId}/`);
        return response.data;
    }
);

// Create a slice
const billSlicer = createSlice({
    name: "clients",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBill.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchBill.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.bill = action.payload;
            })
            .addCase(fetchBill.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Something went wrong";
            });
    },
});

export default billSlicer.reducer;
