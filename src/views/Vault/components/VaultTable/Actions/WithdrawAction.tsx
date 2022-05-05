import React, { useCallback, useMemo, useState } from 'react';
import { Flex, Text } from '@my/ui';
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import { BIG_ZERO } from 'utils/bigNumber';
import { useAppDispatch } from 'state';
import useToast from 'hooks/useToast';
import { LongButton } from './styles';
import styled from 'styled-components';
import CInput from './C_Input';
import { getFullDisplayBalance } from 'utils/formatBalance';
import { useVault } from 'state/vault/hooks';
import useVaultWithdraw from 'views/Vault/hooks/useVaultWithdraw';
import { changeLoading, changeVaultItemLoading, fetchVaultFarmUserDataAsync } from 'state/vault';
import Loading from 'components/TransactionConfirmationModal/Loading';
import { ActionContainerBg, ActionContainerSize } from 'style/TableStyled';
import { showDecimals } from 'views/Vault/utils';
const _rate = 1;

interface WithdrawActionProps {
  userDataReady: boolean;
  displayBalance: string | JSX.Element;
  earnings: BigNumber;
  isApproved: boolean;
  handleApprove: any;
  requestedApproval: boolean;
  pid: number;
  name: string;
  displayEarningsBalance?: string;
  lpSymbol: string;
  contractAddress: string;
  lpAddressDecimals: number;
  lpToCLpRate: string;
  index: number;
}
const FlexStyled = styled(Flex)`
  margin-top: 0;
  justify-content: space-between;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
  }
`;

const WithdrawAction: React.FunctionComponent<WithdrawActionProps> = ({
  pid,
  earnings,
  userDataReady,
  requestedApproval,
  displayEarningsBalance,
  lpSymbol,
  contractAddress,
  lpAddressDecimals,
  lpToCLpRate,
  index,
}) => {
  const { data: vaults } = useVault();
  const { toastSuccess, toastError } = useToast();

  const [pendingTx, setPendingTx] = useState(false);
  const [pendingTxSuccess, setPendingTxSuccess] = useState(true);

  const dispatch = useAppDispatch();
  const { account } = useWeb3React();
  const { onWithdraw } = useVaultWithdraw(account, contractAddress, lpAddressDecimals);
  const [val, setVal] = useState('');
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(earnings, lpAddressDecimals, showDecimals(lpSymbol));
  }, [earnings, lpAddressDecimals, lpSymbol]);
  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'));
      }
    },
    [setVal],
  );

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance);
  }, [fullBalance, setVal]);

  const valNumber = new BigNumber(val);
  const fullBalanceNumber = new BigNumber(fullBalance);
  const handleWithdraw = useCallback(async () => {
    setPendingTx(true);
    let result = null;
    try {
      let _amount = new BigNumber(val)
        .times(1 / Number(lpToCLpRate))
        .times(_rate)
        .times(0.99999)
        .toString();
      if (Number(_amount) > Number(val)) {
        _amount = val;
      }
      result = await onWithdraw(_amount);
      if (typeof result === 'boolean' && result) {
        dispatch(changeLoading());
        dispatch(changeVaultItemLoading({ index }));
        dispatch(fetchVaultFarmUserDataAsync({ account, vaults, index }));
        toastSuccess(`Withdraw!`, `'Your ${lpSymbol} earnings have been sent to your wallet!'`);
        setTimeout(() => {
          setPendingTxSuccess(true);
        }, 10000);
      } else {
        const message = result ? result : `Your ${lpSymbol} withdraw failed!`;
        toastError('Error', message);
        setPendingTxSuccess(false);
        setTimeout(() => {
          setPendingTxSuccess(true);
        }, 1500);
      }
    } catch (e: any) {
      toastError('Error', e.message ? e.message : `Your ${lpSymbol} withdraw failed! `);
      setPendingTxSuccess(false);
      setTimeout(() => {
        setPendingTxSuccess(true);
      }, 1500);
    } finally {
      setVal('');
      setPendingTx(false);
    }
  }, [val, lpToCLpRate, account, index, vaults, dispatch, lpSymbol, onWithdraw, toastError, toastSuccess]);

  const disabled =
    requestedApproval ||
    earnings.eq(BIG_ZERO) ||
    pendingTx ||
    !userDataReady ||
    !valNumber.isFinite() ||
    valNumber.eq(0) ||
    valNumber.gt(fullBalanceNumber);

  return (
    <ActionContainerSize smallBorder={disabled ? false : true}>
      <Text textAlign="right" fontSize="12px" marginBottom="8px" fontWeight="500">
        LP Withdrawable: {displayEarningsBalance}
        {/* {lpSymbol ? ` ${lpSymbol}` : ''} */}
      </Text>
      <ActionContainerBg smallBorder={disabled ? false : true}>
        <FlexStyled>
          <CInput value={val} onSelectMax={handleSelectMax} onChange={handleChange} />
          <LongButton variant="primary" isLoading={pendingTx} disabled={disabled} onClick={handleWithdraw}>
            Withdraw
            {/* {pendingTx ? 'Withdrawing' : ''} */}
            <Loading isLoading={pendingTx} success={pendingTxSuccess} />
          </LongButton>
        </FlexStyled>
      </ActionContainerBg>
    </ActionContainerSize>
  );
};

export default WithdrawAction;
