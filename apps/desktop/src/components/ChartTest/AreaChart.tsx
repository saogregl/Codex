import { useState, useMemo } from "react";
import { AreaChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";

type Props = {};

const AreaChartExample = (props: Props) => {
  const data = [
    {
      group: "Dataset 1",
      date: "2019-01-01T00:00:00.000Z",
      value: 0,
    },
    {
      group: "Dataset 1",
      date: "2019-01-06T00:00:00.000Z",
      value: -37312,
    },
    {
      group: "Dataset 1",
      date: "2019-01-08T00:00:00.000Z",
      value: -22392,
    },
    {
      group: "Dataset 1",
      date: "2019-01-15T00:00:00.000Z",
      value: -52576,
    },
    {
      group: "Dataset 1",
      date: "2019-01-19T00:00:00.000Z",
      value: 20135,
    },
    {
      group: "Dataset 2",
      date: "2019-01-01T00:00:00.000Z",
      value: 47263,
    },
    {
      group: "Dataset 2",
      date: "2019-01-05T00:00:00.000Z",
      value: 14178,
    },
    {
      group: "Dataset 2",
      date: "2019-01-08T00:00:00.000Z",
      value: 23094,
    },
    {
      group: "Dataset 2",
      date: "2019-01-13T00:00:00.000Z",
      value: 45281,
    },
    {
      group: "Dataset 2",
      date: "2019-01-19T00:00:00.000Z",
      value: -63954,
    },
  ];

  const Data = useMemo(() => [...data], []);

  const options = {
    title: "Area (time series - natural curve)",
    axes: {
      bottom: {
        title: "2019 Annual Sales Figures",
        mapsTo: "date",
        scaleType: ScaleTypes.TIME,
      },
      left: {
        mapsTo: "value",
        scaleType: ScaleTypes.LINEAR,
      },
    },
    curve: "curveNatural",
  };

  return (
    <div style={{padding: "0 15px 0 15px"}}>
      {" "}
      <AreaChart data={Data} options={options}></AreaChart>
    </div>
  );
};

export default AreaChartExample;
