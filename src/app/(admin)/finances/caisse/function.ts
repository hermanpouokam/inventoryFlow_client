import { instance } from "@/components/fetch"

const validateOperation = async (id: number) => {
    try {
        const res = await instance.patch(`/cash-transactions/${id}/validate/`)
        return res
    } catch (error) {
        throw error
    }
}

const deleteOperation = async (id: number) => {
    try {
        const res = await instance.delete(`/cash-transactions/${id}/`)
        return res
    } catch (error) {
        throw error
    }
}

export { validateOperation, deleteOperation }