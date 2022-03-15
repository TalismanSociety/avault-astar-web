import React, { useCallback, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'contexts/Localization';
import { connectorLocalStorageKey, ConnectorNames, Flex, LinkExternal, useMatchBreakpoints } from '@avault/ui';
import { getAddress } from 'utils/addressHelpers';
import { getBscScanLink } from 'utils';
import DepositAction from './DepositAction';
import WithdrawAction from './WithdrawAction';
import { AprProps } from '../Apr';
import { MultiplierProps } from '../Multiplier';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from 'utils/bigNumber';
import { getFullDisplayBalance } from 'utils/formatBalance';
import { useWeb3React } from '@web3-react/core';
import MobileAction from './MobileAction';
import { useSpecialApproveFarm } from 'views/Compounding/hooks/useApproveFarm';
import { useERC20 } from 'hooks/useContract';
import { useAppDispatch } from 'state';
import { ICompounding } from 'state/compounding/types';
import { getDisplayApy } from 'views/Compounding/Compounding';
import { useCompounding, useCompoundingFarmUser } from 'state/compounding/hooks';
import useAuth from 'hooks/useAuth';
import { chainId } from 'config/constants/tokens';
import { fetchCompoundingFarmUserDataAsync } from 'state/compounding';

export interface ActionPanelProps {
  apr: AprProps;
  multiplier: MultiplierProps;
  details: ICompounding;
  userDataReady: boolean;
  expanded: boolean;
}

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 500px;
  }
`;

const collapseAnimation = keyframes`
  from {
    max-height: 500px;
  }
  to {
    max-height: 0px;
  }
`;

const Container = styled.div<{ expanded }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: unset;
  display: flex;
  flex-direction: column;
  margin: -44px 16px 20px;
  border-radius: 12px;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
    overflow: hidden;
    margin: 0 40px;
    background-color: ${({ theme }) => theme.colors.background02};
    padding: 24px;
  }
`;

const StyledLinkExternal = styled(LinkExternal)`
  color: ${({ theme }) => theme.colors.primaryDark};
  font-weight: 600;
  font-size: 12px;
  padding: 5px 10px 5px 0;
  svg {
    width: 14px;
    path {
      fill: ${({ theme }) => theme.colors.primaryDark};
    }
  }
`;

const ActionContainer = styled.div`
  flex-direction: column;
  flex-flow: row wrap;
  display: none;
  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
  }
`;
const InfoContainerSmall = styled(Flex)`
  margin-top: 10px;
  padding-top: 6px;
  justify-content: start;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;
const InfoContainer = styled.div`
  display: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  display: none;
  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    align-items: start;
    max-width: 300px;
    min-width: 120px;
    margin-right: 10%;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    max-width: 200px;
    min-width: 80px;
  }
`;

const DetailContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  padding: 8px 16px;
  margin-top: 14px;
  p {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${({ theme }) => theme.colors.textSubtle};
    font-size: 12px;
    font-weight: 600;
    padding: 6px 0;
  }
  i {
    text-align: right;
    display: block;
    font-style: normal;
    font-size: 12px;
    line-height: 16px;
    color: ${({ theme }) => theme.colors.text};
    &.green {
      font-size: 15px;
      font-weight: bold;
      color: ${({ theme }) => theme.colors.success};
      margin-bottom: 3px;
    }
    &.grey {
      color: ${({ theme }) => theme.colors.textSubtle};
    }
  }
  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;

const ActionPanel: React.FunctionComponent<ActionPanelProps> = ({
  details,
  apr,
  multiplier,
  userDataReady,
  expanded,
}) => {
  const compounding = details;
  const { isXl, isLg } = useMatchBreakpoints();
  const isMobile = !(isXl || isLg);

  const { t } = useTranslation();
  const lpAddress = getAddress(compounding.farm.lpAddresses);
  const bsc = getBscScanLink(lpAddress, 'address');
  const { account } = useWeb3React();
  const { avaultAddressBalance, allowance } = useCompoundingFarmUser(compounding.farm.pid);
  const isApproved = account && allowance && allowance.isGreaterThan(0);
  // const stakingBigNumber = new BigNumber(compounding.farm.userData.stakingTokenBalance);
  let earnings = BIG_ZERO;
  let displayEarningsBalance: string = '';

  // If user didn't connect wallet default balance will be 0
  if (isApproved) {
    const _wantLockedTotal = new BigNumber(compounding.compounding.wantLockedTotal);
    const _totalSupply = new BigNumber(compounding.compounding.totalSupply);
    // _totalSupply： 282962782793973
    // avaultAddressBalance： 89962782593973
    // _wantLockedTotal： 284598115334499
    earnings = _wantLockedTotal.dividedBy(_totalSupply).times(avaultAddressBalance);
    // earnings = getBalanceAmount(_value, compounding.farm.quoteTokenDecimals);
    // wantLockedTotal / totalSupply()*CLpAmount
    // earningsBusd = earnings.multipliedBy(cakePrice).toNumber();
    displayEarningsBalance = getFullDisplayBalance(earnings, compounding.farm.quoteTokenDecimals, 5);
  }

  const lpContract = useERC20(lpAddress);
  const [requestedApproval, setRequestedApproval] = useState(false);
  const { onApprove } = useSpecialApproveFarm(lpContract, compounding.contractAddress[chainId]);
  const dispatch = useAppDispatch();
  const { login } = useAuth();
  const { data: compoundings } = useCompounding();
  const handleApprove = useCallback(async () => {
    if (!account) {
      const connectorId = (window.localStorage.getItem(connectorLocalStorageKey) ?? 'injected') as ConnectorNames;
      login(connectorId);
      return;
    }
    try {
      setRequestedApproval(true);
      await onApprove();
      dispatch(fetchCompoundingFarmUserDataAsync({ account, compoundings }));

      setRequestedApproval(false);
    } catch (e) {
      console.error(e);
    }
  }, [onApprove, dispatch, login, account, compoundings]);

  return (
    <Container expanded={expanded}>
      <InfoContainer>
        <StyledLinkExternal href={bsc}>{t('Add Liquidity')}</StyledLinkExternal>
        <StyledLinkExternal href={bsc}>{t('View Contract')}</StyledLinkExternal>
      </InfoContainer>
      <DetailContainer>
        <p>
          TVL
          <i>${compounding?.compounding?.liquidity ?? ''}</i>
        </p>
        <p>
          APY
          <em>
            <i className="green">{compounding?.farm?.apy ? getDisplayApy(Number(compounding.farm.apy)) + '%' : ''}</i>
            <i className="grey">CTO APY: -%</i>
            <i className="grey">
              {compounding.farm.lpSymbol} APY:
              {compounding?.farm?.apy ? getDisplayApy(Number(compounding.farm.apy)) + '%' : ''}
            </i>
          </em>
        </p>
        <p>
          You Balance
          <em>
            <i>
              - {compounding.compounding.balance} {compounding?.compounding.symbol}
            </i>
            <i>
              {getFullDisplayBalance(
                new BigNumber(compounding.farm.userData.stakingTokenBalance),
                compounding.farm.quoteTokenDecimals,
                4,
              )}{' '}
              {compounding.farm.lpSymbol}
            </i>
          </em>
        </p>
        <InfoContainerSmall>
          <StyledLinkExternal href={bsc}>{t('Add Liquidity')}</StyledLinkExternal>
          <StyledLinkExternal href={bsc}>{t('View Contract')}</StyledLinkExternal>
        </InfoContainerSmall>
      </DetailContainer>
      {isMobile ? (
        <MobileAction
          requestedApproval={requestedApproval}
          isApproved={isApproved}
          pid={compounding.farm.pid}
          displayBalance={getFullDisplayBalance(
            new BigNumber(compounding.farm.userData.stakingTokenBalance),
            compounding.farm.quoteTokenDecimals,
            4,
          )}
          displayEarningsBalance={displayEarningsBalance}
          earnings={earnings}
          userDataReady={userDataReady}
          handleApprove={handleApprove}
          account={account}
          lpSymbol={compounding.farm.lpSymbol}
          contractAddress={compounding.contractAddress[chainId]}
          stakingTokenBalance={new BigNumber(compounding?.farm?.userData?.stakingTokenBalance ?? '0')}
          quoteTokenDecimals={compounding.farm.quoteTokenDecimals}
        />
      ) : (
        <ActionContainer style={{ justifyContent: 'end' }}>
          <DepositAction
            contractAddress={compounding.contractAddress[chainId]}
            quoteTokenDecimals={compounding.farm.quoteTokenDecimals}
            requestedApproval={requestedApproval}
            isApproved={isApproved}
            displayBalance={getFullDisplayBalance(
              new BigNumber(compounding?.farm?.userData?.stakingTokenBalance ?? '0'),
              compounding.farm.quoteTokenDecimals,
              4,
            )}
            displayEarningsBalance={displayEarningsBalance}
            earnings={earnings}
            handleApprove={handleApprove}
            userDataReady={userDataReady}
            pid={compounding.farm.pid}
            name={compounding.compounding.name}
            lpSymbol={compounding.farm.lpSymbol}
          />
          <div className="w20"></div>
          <WithdrawAction
            contractAddress={compounding.contractAddress[chainId]}
            quoteTokenDecimals={compounding.farm.quoteTokenDecimals}
            requestedApproval={requestedApproval}
            isApproved={isApproved}
            displayBalance={getFullDisplayBalance(
              new BigNumber(compounding?.farm?.userData?.stakingTokenBalance ?? '0'),
              compounding.farm.quoteTokenDecimals,
              4,
            )}
            displayEarningsBalance={displayEarningsBalance}
            earnings={earnings}
            userDataReady={userDataReady}
            handleApprove={handleApprove}
            pid={compounding.farm.pid}
            name={compounding.compounding.name}
            lpSymbol={compounding.farm.lpSymbol}
          />
        </ActionContainer>
      )}
    </Container>
  );
};

export default ActionPanel;
