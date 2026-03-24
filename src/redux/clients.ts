//@ts-nocheck
import { instance } from "@/components/fetch"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// =========================
// TYPES
// =========================
interface Customer {
  balance: number
  id: number
  name: string
  surname?: string
  number?: string
  address?: string
}

interface CustomerState {
  data: Customer[]
  selectedClient: Customer | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: CustomerState = {
  data: [],
  selectedClient: null,
  status: "idle",
  error: null,
}

interface Params {
  categories?: number[]
  sales_points?: number[]
}

// =========================
// 🔥 FETCH LISTE CLIENTS
// =========================
export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async ({ sales_points, categories }: Params = {}) => {
    const params = new URLSearchParams()

    sales_points?.forEach((sp) => {
      params.append("sales_point", sp.toString())
    })

    categories?.forEach((cat) => {
      params.append("category", cat.toString())
    })

    const query = params.toString()
    const url = query ? `/clients/?${query}` : `/clients/`

    const response = await instance.get(url)
    return response.data
  }
)

// =========================
// 🔥 FETCH CLIENT PAR ID
// =========================
export const fetchClientById = createAsyncThunk(
  "clients/fetchClientById",
  async (id: number) => {
    const response = await instance.get(`/clients/${id}/`)
    return response.data
  }
)

// =========================
// SLICE
// =========================
const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    clearSelectedClient: (state) => {
      state.selectedClient = null
    },
  },
  extraReducers: (builder) => {
    builder

      // =========================
      // LISTE
      // =========================
      .addCase(fetchClients.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.data = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Erreur"
      })

      // =========================
      // DETAIL CLIENT
      // =========================
      .addCase(fetchClientById.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.selectedClient = action.payload

        // 🔥 sync avec la liste (cache simple)
        const index = state.data.findIndex(
          (c) => c.id === action.payload.id
        )

        if (index !== -1) {
          state.data[index] = action.payload
        } else {
          state.data.push(action.payload)
        }
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Erreur"
      })
  },
})

// =========================
// EXPORTS
// =========================
export const { clearSelectedClient } = clientsSlice.actions

export default clientsSlice.reducer