import { configureStore } from "@reduxjs/toolkit";
import userReducer  from "../redux/slices/authenticationSlice"

const store = configureStore({
  reducer:{
    auth:userReducer
  }
})

export type AppDispatch = typeof store.dispatch
export default store;
