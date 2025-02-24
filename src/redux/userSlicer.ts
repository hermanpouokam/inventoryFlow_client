// redux/yourSlice.ts
import { getUserData, instance } from "@/components/auth";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface YourState {
  data: User;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: YourState = {
  data: {
    id: 0,
    name: "",
    surname: "",
    username: "",
    email: "",
    enterprise: null,
    number: null,
    user_type: "",
    created_at: undefined,
    last_update: undefined,
  },
  status: "idle",
  error: null,
};
// Create an async thunk for fetching data
export const getCurrentUser = createAsyncThunk(
  "user/getCurrentUser",
  async () => {
    const user = await getUserData();
    return user;
  }
);

// Create a slice
const getCurrentUserSlicer = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default getCurrentUserSlicer.reducer;
