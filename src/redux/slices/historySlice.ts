import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios";
import { BACKEND_BASE_URL } from "../../constants";

const initialState = {}

const fetchFills = createAsyncThunk(
  'history/fills/symbol',
  async function({count, offset,symbol, market}:{count:string,offset:string, symbol:string, market:string},{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/history/fills/${market}/${symbol}?count=${count}&offset=${offset}`, {
        headers: {
          'Authorization':`Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data
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

const fetchOrders = createAsyncThunk(
  'history/fills/symbol',
  async function({count, offset,symbol, market}:{count:string,offset:string, symbol:string, market:string},{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/history/orders/${market}/${symbol}?count=${count}&offset=${offset}`, {
        headers: {
          'Authorization':`Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data
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

const historySlice = createSlice({
  name:"history",
  initialState,
  reducers:{}
})

export default historySlice.reducer
export {
  fetchFills,
  fetchOrders
}