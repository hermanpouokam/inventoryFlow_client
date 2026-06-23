import { instance } from "@/components/fetch";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface EnterpriseUser {
    id: number;
    name: string;
    surname: string | null;
    username: string;
    email: string;
    is_active: boolean;
    country: string | null;
    number: string | null;
    enterprise: number | null;
    user_type: "admin" | "manager" | "employee";
    created_at: string;
    last_update: string;
    img: string | null;
    sales_point: number | null;
    sales_point_details: SalesPoint | null;
    permissions: { id: number; name: string }[];
    action_permissions: { id: number; name: string; label: string }[];
}

interface State {
    data: EnterpriseUser[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: State = {
    data: [],
    status: "idle",
    error: null,
};

interface Params {
    sales_point?: number[];
}

// Récupère les comptes (User) de l'entreprise connectée.
// Scoping (entreprise / point de vente du manager) déjà géré côté backend.
export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async ({ sales_point }: Params = {}) => {
        const params = new URLSearchParams();
        sales_point?.forEach((sp) => {
            if (sp) {
                params.append("sales_point", sp as unknown as string);
            }
        });
        const query = params.toString();

        const response = await instance.get(`/users/?${query}`);
        return response.data;
    }
);

const usersSlicer = createSlice({
    name: "users",
    initialState,
    reducers: {
        // Mise à jour optimiste locale après un PATCH (évite un refetch complet)
        userUpdatedLocally: (state, action) => {
            const index = state.data.findIndex((u) => u.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = { ...state.data[index], ...action.payload };
            }
        },
        userRemovedLocally: (state, action) => {
            state.data = state.data.filter((u) => u.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Something went wrong";
            });
    },
});

export const { userUpdatedLocally, userRemovedLocally } = usersSlicer.actions;
export default usersSlicer.reducer;