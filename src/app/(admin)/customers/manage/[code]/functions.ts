import { instance } from "@/components/fetch"

const payDebt = async (amount: number, bill_id: number) => {
    try {
        const res = await instance.post(`debts/${bill_id}/pay/`, {
            amount
        })

        return res
    } catch (error) {
        throw error
    }

}

export { payDebt }