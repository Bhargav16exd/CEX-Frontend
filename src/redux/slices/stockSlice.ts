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

const getSpotStocks = createAsyncThunk(
  'market/spot-stocks',
  async function(_:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/market/stocks/spot`, {
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

const getPerpStocks = createAsyncThunk(
  'market/perp-stocks',
  async function(_:any,{rejectWithValue}) {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/market/stocks/perp`, {
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

const stockSlice = createSlice({
  name:"Stock",
  initialState,
  reducers:{}
})

export default stockSlice.reducer

export {
  createStock,
  getSpotStocks,
  getPerpStocks
}