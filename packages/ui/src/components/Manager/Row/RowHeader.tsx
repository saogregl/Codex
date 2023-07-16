import React from "react";
import type { HeaderProps } from "./Row";
import classNames from "classnames";
import { settings } from "../../../constants/settings";

const RowHeader = ({ statusTitle }: HeaderProps) => {
  return (
    <div>
      <div className={classNames(`${settings.sipePrefix}--row-header`)}>
        <p>{statusTitle}</p>
      </div>
    </div>
  );
};

export default RowHeader;
