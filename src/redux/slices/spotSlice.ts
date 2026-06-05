import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../constants";

const initialState = {};

const placeSpotOrder = createAsyncThunk(
  'spot/order',
  async function (payload:any,{rejectWithValue}){
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/spot/order`, payload, {
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

const getBalance = createAsyncThunk(
  'user/balance',
  async function (symbol:string,{rejectWithValue}) {
    try {
      const balanceResponse = await axios.get(`${BACKEND_BASE_URL}/user/balance/spot`,{
        headers: {
          'Authorization':`Bearer ${localStorage.getItem("token")}`
        }
      });

      const stockBalanceResposne = await axios.get(`${BACKEND_BASE_URL}/spot/stocks/${symbol}`,{
        headers: {
          'Authorization':`Bearer ${localStorage.getItem("token")}`
        }
      });

      return {
        balance : balanceResponse.data,
        stockBalance : stockBalanceResposne.data
      }
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
  'spot/depth',
  async function (stockSymbol:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/spot/depth/${stockSymbol}`,{
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
  async function({symbol, count, offset}:{symbol:string, count:number, offset:number},{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/spot/order/open/${symbol}?count=${count}&offset=${offset}`, {
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

const spotOrderSlice = createSlice({
  name:"SpotOrder",
  initialState,
  reducers:{}
})

export default spotOrderSlice.reducer;
export { 
  placeSpotOrder,
  getBalance,
  getOrderbook,
  fetchOpenOrders
}