import React, { PropsWithChildren } from "react";

import { RowHeader } from "./";
import { RowHeaderItem } from "./";
import RowViewport from "./RowViewport";
import { settings } from "../../../constants/settings";
import classnames from "classnames";

export interface HeaderProps {
  statusTitle: string;
}
export interface ManufacturingItem {
  ItemTitle: string;
  ItemSubtitle: string;
  itemStatus: string;
}

type Props = {
  items: ManufacturingItem[];
};

const Row = ({ items }: Props) => {
  const RowContainer: React.FC<PropsWithChildren> = ({
    children,
  }: PropsWithChildren) => {
    return (
      <div className={classnames(`${settings.sipePrefix}--row-container`)}>
        {children}
      </div>
    );
  };

  return (
    <RowContainer>
      <div
        className={classnames(`${settings.sipePrefix}--row-header-container`)}
      >
        <RowHeader statusTitle="Teste" />
        {items.map(({ itemStatus, ItemSubtitle, ItemTitle }, index) => (
          <RowHeaderItem
            key={index}
            ItemTitle={ItemTitle}
            ItemSubtitle={ItemSubtitle}
            itemStatus={itemStatus}
          />
        ))}
      </div>

      <RowViewport />
    </RowContainer>
  );
};

export default Row;
