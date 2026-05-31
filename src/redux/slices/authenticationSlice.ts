import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../constants";

const initialState:any = {
  token: localStorage.getItem("token") || "",
  role: localStorage.getItem("role") || ""
}

const signup = createAsyncThunk(
  'user/signup',
  async function(payload:any,{rejectWithValue}){
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/user/signup`, payload);
      return response
    } catch (error) {
      if(axios.isAxiosError(error)){
        return rejectWithValue({
          status:error?.response?.data?.statusCode,
          message:error?.response?.data?.message
        })
      }
    }
  }
)
 
const signin = createAsyncThunk(
  'user/signin',
  async function(payload:any, {rejectWithValue}) {
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/user/signin`, payload);
      return response
    } catch (error) {
      if(axios.isAxiosError(error)){
        return rejectWithValue({
          status:error?.response?.data?.statusCode,
          message:error?.response?.data?.message
        })
      }
    }
  }
)

const authenticationSlice = createSlice({
  name:"Authentication",
  initialState,
  reducers:{},
  extraReducers:(builder:ActionReducerMapBuilder<any>)=>{
    builder
    .addCase(signin.fulfilled, (state, action)=>{
      localStorage.setItem("token", action.payload?.data.data.token);
      localStorage.setItem("role", action.payload?.data.data.role);
      state.role = action.payload?.data.data.role
    })
  }
})

export {
  signup,
  signin
}

export default authenticationSlice.reducer