import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../constants";

const initialState = {}

const getBalance = createAsyncThunk(
  'user/balance',
  async function (_:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/user/balance/perp`,{
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

const getOrderbook = createAsyncThunk(
  'perp/depth',
  async function (stockSymbol:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/perpetual/depth/${stockSymbol}`,{
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

const placePerpOrder = createAsyncThunk(
  'perp/order',
  async function (payload:any,{rejectWithValue}){
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/perpetual/order`, payload, {
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

const fetchOpenOrders = createAsyncThunk(
  'history/fills/symbol',
  async function(symbol:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/perpetual/order/open/${symbol}`, {
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

const fetchOpenContract = createAsyncThunk(
  'history/fills/symbol',
  async function(symbol:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/perpetual/contracts/open/${symbol}`, {
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


const perpOrderSlice = createSlice({
  name:"PerpOrder",
  initialState,
  reducers:{}
})

export default perpOrderSlice.reducer
export {
  getBalance,
  getOrderbook,
  placePerpOrder,
  fetchOpenOrders,
  fetchOpenContract
}