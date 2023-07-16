import React from "react";
import type { ManufacturingItem } from "./Row";

const RowHeaderItem = ({
  ItemTitle,
  ItemSubtitle,
  itemStatus,
}: ManufacturingItem) => {
  return (
    <div>
      <div>{ItemTitle}</div>
      <div>{ItemSubtitle}</div>
      <div>{itemStatus}</div>
    </div>
  );
};

export default RowHeaderItem;
