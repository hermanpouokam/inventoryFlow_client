// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import clientDataReducer from "./customerBillSlicer";
import clientCatReducer from "./clientCatSlicer";
import clientsReducer from "./clients";
import salesPointsReducer from "./salesPointsSlicer";
import billsReducer from "./billSlicer";
import billReducer from "./billDetailsSlicer";
import employeesReducer from "./employeesSlicer";
import userReducer from "./userSlicer";
import productsReducer from "./productsSlicer";
import productsCatReducer from "./productsCat";
import suppliersReducer from "./suppliersSlicer";
import PackagingsReducer from "./packagingsSlicer";
import suppliesReducer from "./supplies";
import lossesReducer from "./losses";
import expensesReducer from "./expenses";
import inventoriesReducer from "./inventory";
import packagingInventoriesReducer from "./packagingInventory";

const store = configureStore({
  reducer: {
    clientCat: clientCatReducer,
    salesPoints: salesPointsReducer,
    clients: clientsReducer,
    clientData: clientDataReducer,
    bills: billsReducer,
    employees: employeesReducer,
    user: userReducer,
    products: productsReducer,
    productsCat: productsCatReducer,
    suppliers: suppliersReducer,
    supplies: suppliesReducer,
    packagings: PackagingsReducer,
    bill: billReducer,
    inventories: inventoriesReducer,
    losses: lossesReducer,
    expenses: expensesReducer,
    packagingInventories: packagingInventoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
