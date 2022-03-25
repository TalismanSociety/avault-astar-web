import styled from 'styled-components';

const ArrowDownStyled = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  z-index: 2;
`;
const ArrowDown = () => {
  return (
    <ArrowDownStyled>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
        <g transform="translate(2 2)" fill="none" fillRule="evenodd">
          <rect stroke="#25234C" strokeWidth="2" fill="#201F43" x="-1" y="-1" width="22" height="30" rx="8" />
          <path
            d="M9.08252458,7.375 C9.08252458,6.68464406 9.64216864,6.125 10.3325246,6.125 C11.0228805,6.125 11.5825246,6.68464406 11.5825246,7.375 L11.5825246,14.875 L13.7109525,14.875 C13.9324797,14.875 14.1477364,14.9485583 14.3229358,15.0841293 C14.7597216,15.4221183 14.8398123,16.0501975 14.5018232,16.4869833 L14.5018232,16.4869833 L11.1233953,20.8529517 C11.0715796,20.9199135 11.0114696,20.9800235 10.9445079,21.0318391 C10.507722,21.3698282 9.87964291,21.2897375 9.54165388,20.8529517 L9.54165388,20.8529517 L6.16322592,16.4869833 C6.02765497,16.3117839 5.95409662,16.0965272 5.95409662,15.875 C5.95409662,15.3227153 6.40181188,14.875 6.95409662,14.875 L6.95409662,14.875 L9.08252458,14.875 L9.08252458,7.375 Z"
            fill="#FFF"
          />
        </g>
      </svg>
    </ArrowDownStyled>
  );
};
export default ArrowDown;
