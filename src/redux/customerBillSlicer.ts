// redux/yourSlice.ts
import { instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface YourState {
    data: Customer[];
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
    customer_code: string;
    start_date?: Date;
    end_date?: Date;
}
// Create an async thunk for fetching data
export const fetchClientsData = createAsyncThunk(
    "clients/fetchClientsData",
    async ({ start_date, end_date, customer_code }: Params) => {
        const params = {
            customer_code,
            ...(start_date ? { start_date } : {}),
            ...(end_date ? { end_date } : {}),
        };
        const response = await instance.get("/bills/customer/", { params }); // Adjust endpoint as needed
        return response.data;
    }
);

// Create a slice
const clientDataSlicer = createSlice({
    name: "clientData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClientsData.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchClientsData.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchClientsData.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Something went wrong";
            });
    },
});

export default clientDataSlicer.reducer;
