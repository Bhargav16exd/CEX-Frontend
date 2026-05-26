import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../constants";

const initialState:any = []

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

const authenticationSlice = createSlice({
  name:"Authentication",
  initialState,
  reducers:{},
})

export {
  signup
}

export default authenticationSlice.reducer