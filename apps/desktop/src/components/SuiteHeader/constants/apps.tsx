import {
  Development,
  Industry,
  ContinuousDeployment,
  AgricultureAnalytics,
  ContinuousIntegration,
  IbmWatsonMachineLearning,
} from "@carbon/icons-react";

interface route {
  ItemName: string;
  href: string;
  icon?: (params: any) => any | object;
}

export const Apps: route[] = [
  {
    ItemName: "Home",
    href: "/home",
    icon: (params: any) => <Development {...params} />,
  },
];
