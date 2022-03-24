import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CompoundingState } from 'state/types';
import compoundingsConfig from 'config/constants/compounding';
import fetchCompoundings from './fetchCompoundings';
import { ICompounding, ICompoundingUserData } from './types';
import {
  fetchCompoundingsFarmEarnings,
  fetchCompoundingsFarmStakedBalances,
  fetchCompoundingsFarmUserAllowances,
  fetchCompoundingsFarmUserTokenBalances,
  fetchCompoundingsUsers,
} from './fetchCompoundingUser';
const initialState: CompoundingState = {
  data: [],
  allLiquidity: '',
  userDataLoaded: false,
};
export const fetchCompoundingsPublicDataAsync = createAsyncThunk<
  [ICompounding[], string],
  { priceVsBusdMap: Record<string, string> }
>('compounding/fetchCompoundingsPublicDataAsync', async ({ priceVsBusdMap }) => {
  const compoundings = await fetchCompoundings(compoundingsConfig, priceVsBusdMap);
  return compoundings;
});
export const fetchCompoundingFarmUserDataAsync = createAsyncThunk<
  ICompoundingUserData[],
  {
    account: string;
    compoundings: ICompounding[];
  }
>('compounding/fetchCompoundingFarmUserDataAsync', async ({ account, compoundings }) => {
  const userCompoundingsFarmAllowances = await fetchCompoundingsFarmUserAllowances(account, compoundings);
  const userCompoundingsFarmTokenBalances = await fetchCompoundingsFarmUserTokenBalances(account, compoundings);
  const userCompoundingsStakedBalances = await fetchCompoundingsFarmStakedBalances(account, compoundings);
  const userCompoundingEarnings = await fetchCompoundingsFarmEarnings(account, compoundings);
  const [userCompoundingUsers, userCompoundingSupply, compoundingWantLockedTotal] = await fetchCompoundingsUsers(
    account,
    compoundings,
  );
  return userCompoundingsFarmAllowances.map((farmAllowance, index) => {
    return {
      pid: compoundings[index].farm.pid,
      allowance: farmAllowance,
      stakingTokenBalance: userCompoundingsFarmTokenBalances[index],
      stakedBalance: userCompoundingsStakedBalances[index],
      pendingReward: userCompoundingEarnings[index],
      avaultAddressBalance: userCompoundingUsers[index],
      userCompoundingSupply: userCompoundingSupply[index],
      compoundingWantLockedTotal: compoundingWantLockedTotal[index],
    };
  });
});
export const compoundingSlice = createSlice({
  name: 'Compounding',
  initialState,
  reducers: {
    changeLoading: (state) => {
      state.userDataLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCompoundingsPublicDataAsync.fulfilled, (state, action) => {
      state.userDataLoaded = true;
      state.data = action.payload[0];
      state.allLiquidity = action.payload[1];
    });
    builder.addCase(fetchCompoundingFarmUserDataAsync.fulfilled, (state, action) => {
      action.payload.forEach((userDataEl) => {
        const { pid } = userDataEl;
        const index = state.data.findIndex((compounding: ICompounding) => compounding.farm.pid === pid);

        const lpToCLpRate =
          userDataEl.compoundingWantLockedTotal &&
          userDataEl.userCompoundingSupply &&
          Number(userDataEl.compoundingWantLockedTotal) > 0 &&
          Number(userDataEl.userCompoundingSupply) > 0
            ? (Number(userDataEl.compoundingWantLockedTotal) / Number(userDataEl.userCompoundingSupply)).toFixed(4)
            : '1';

        state.data[index] = {
          ...state.data[index],
          compounding: {
            ...state.data[index].compounding,
            totalSupply: userDataEl.userCompoundingSupply,
            wantLockedTotal: userDataEl.compoundingWantLockedTotal,
            lpToCLpRate: lpToCLpRate,
          },
          farm: {
            ...state.data[index].farm,
            userData: userDataEl,
          },
        };
      });
      state.userDataLoaded = true;
    });
  },
});
// Actions
export const { changeLoading } = compoundingSlice.actions;

export default compoundingSlice.reducer;