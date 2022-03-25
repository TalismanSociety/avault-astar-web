import { Button, Text } from '@avault/ui';
import styled from 'styled-components';

export const ActionTitles = styled.div``;
export const ActionTitlesTitle = styled(Text)`
  font-weight: 600;
  font-size: 12px;
  line-height: 27px;
  color: ${({ theme }) => theme.colors.text};
`;
export const ActionTitlesBalance = styled(Text)<{ balance: number }>`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme, balance }) => (balance ? theme.colors.primary : theme.colors.textSubSubtle)};
`;
export const ActionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const LongButton = styled(Button)<{ disabled: boolean }>`
  height: 36px;
  border-radius: 8px;
  width: 100%;
  margin-top: 10px;
  // background: ${({ disabled, theme }) => (disabled ? '#eee' : theme.colors.primary)};
  ${({ theme }) => theme.mediaQueries.sm} {
    margin-top: 15px;
  }
`;
