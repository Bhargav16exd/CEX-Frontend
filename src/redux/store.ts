import { configureStore } from "@reduxjs/toolkit";
import userReducer  from "../redux/slices/authenticationSlice"
import stockReducer from "../redux/slices/stockSlice"
import perpOrderReducer from "../redux/slices/perpSlice"
import historyReducer from "../redux/slices/historySlice"
import spotReducer from "../redux/slices/spotSlice"

const store = configureStore({
  reducer:{
    auth:userReducer,
    stock:stockReducer,
    spotOrder:spotReducer,
    perpOrder:perpOrderReducer,
    history:historyReducer
  }
})

export type AppDispatch = typeof store.dispatch
export default store;
