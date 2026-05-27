import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../constants";


const initialState = {}

const createStock = createAsyncThunk(
  'market/create-stock',
  async function(payload:any,{rejectWithValue}) {
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/market/stock`, payload, {
        headers: {
          'Authorization':`Bearer ${localStorage.getItem("token")}`
        }
      });
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

const stockSlice = createSlice({
  name:"Stock",
  initialState,
  reducers:{}
})

export default stockSlice.reducer
export {
  createStock
}