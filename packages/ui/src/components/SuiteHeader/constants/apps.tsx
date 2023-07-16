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
    ItemName: "Project",
    href: "/dashboard/project",
    icon: (params: any) => <Development {...params} />,
  },
  {
    ItemName: "Release",
    href: "/dashboard/release",
    icon: (params: any) => <ContinuousIntegration {...params} />,
  },
  {
    ItemName: "Planner",
    href: "/dashboard/planner",
    icon: (params: any) => <IbmWatsonMachineLearning {...params} />,
  },
  {
    ItemName: "Manufacture",
    href: "/dashboard/manufacture",
    icon: (params: any) => <Industry {...params} />,
  },
  {
    ItemName: "Validate",
    href: "/dashboard/validate",
    icon: (params: any) => <ContinuousDeployment {...params} />,
  },
  {
    ItemName: "Analysis",
    href: "/dashboard/analysis",
    icon: (params: any) => <AgricultureAnalytics {...params} />,
  },
];
