import { configureStore } from "@reduxjs/toolkit";
import userReducer  from "../redux/slices/authenticationSlice"
import stockReducer from "../redux/slices/stockSlice"

const store = configureStore({
  reducer:{
    auth:userReducer,
    stock:stockReducer
  }
})

export type AppDispatch = typeof store.dispatch
export default store;
