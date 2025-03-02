import { instance } from "@/components/fetch";

const validateExpense = async (expenseId: number) => {
    try {
        const response = await instance.post(`/expenses/validate/`, {
            expense_id: expenseId
        });
        return response;
    } catch (error) {
        throw error;
    }
};

const deleteExpense = async (expenseId: number) => {
    try {
        const response = await instance.delete(`/expenses/${expenseId}/delete/`);
        return response;
    } catch (error) {
        throw error;
    }
};

export { validateExpense, deleteExpense };
