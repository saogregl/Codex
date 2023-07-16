import React, { PropsWithChildren } from "react";
import { settings } from "../../../constants/settings";
import classnames from "classnames";

type Props = {};

const RowViewport: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={classnames(`${settings.sipePrefix}--row-viewport-container`)}
    >
      {children}
    </div>
  );
};

export default RowViewport;
