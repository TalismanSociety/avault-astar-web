import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 28 28" {...props}>
      <path
        d="M14.1499158,4.10050506 C14.9783429,4.10050506 15.6499158,4.77207794 15.6499158,5.60050506 L15.6495051,12.3495051 L22.3994949,12.3500842 C23.2279221,12.3500842 23.8994949,13.0216571 23.8994949,13.8500842 L23.8994949,14.1499158 C23.8994949,14.9783429 23.2279221,15.6499158 22.3994949,15.6499158 L15.6495051,15.6495051 L15.6499158,22.3994949 C15.6499158,23.2279221 14.9783429,23.8994949 14.1499158,23.8994949 L13.8500842,23.8994949 C13.0216571,23.8994949 12.3500842,23.2279221 12.3500842,22.3994949 L12.3495051,15.6495051 L5.60050506,15.6499158 C4.77207794,15.6499158 4.10050506,14.9783429 4.10050506,14.1499158 L4.10050506,13.8500842 C4.10050506,13.0216571 4.77207794,12.3500842 5.60050506,12.3500842 L12.3495051,12.3495051 L12.3500842,5.60050506 C12.3500842,4.77207794 13.0216571,4.10050506 13.8500842,4.10050506 L14.1499158,4.10050506 Z"
        fill="#C2C2C2"
        transform="rotate(45 14 14)"
        fillRule="evenodd"
      />
    </Svg>
  );
};

export default Icon;
