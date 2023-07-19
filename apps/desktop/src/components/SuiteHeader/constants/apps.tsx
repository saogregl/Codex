import {
  Development,
  Industry,
  ContinuousDeployment,
  AgricultureAnalytics,
  ContinuousIntegration,
  IbmWatsonMachineLearning,
  Db2Database,
  IbmCloudProjects,
  IbmWatsonKnowledgeCatalog,
  Settings
} from "@carbon/icons-react";

interface route {
  ItemName: string;
  href: string;
  icon?: (params?: any) => any | object;
  children?: route[];
}

export const Apps: route[] = [

  {
    ItemName: "Projetos",
    href: "/projects",
    icon: (params: any) => <IbmCloudProjects {...params} />,
    children: [
      {
        ItemName: "Ver Todos os projetos",
        href: "/projects/all",
      },
    ],
    },        
  {
    ItemName: "Catálogos",
    href: "/catalogs",
    icon: (params: any) => <IbmWatsonKnowledgeCatalog {...params} />,
    children: [
      {
        ItemName: "Ver Todos os Catálogos",
        href: "/catalogs/all",
        icon: (params: any) => <IbmWatsonKnowledgeCatalog {...params} />,
      },
    ],

  },
  {
    ItemName: "Configurações",
    href: "/configurations",
    icon: (params: any) => <Settings {...params} />,
    children: [
      {
        ItemName: "Configurações Gerais",
        href: "/configurations/general",
        icon: (params: any) => <IbmWatsonKnowledgeCatalog {...params} />,
      },
      {
        ItemName: "Integrações",
        href: "/configurations/integrations",
        icon: (params: any) => <IbmWatsonKnowledgeCatalog {...params} />,
      },
      {
        ItemName: "Preferências de Usuário",
        href: "/configurations/user-preferences",
        icon: (params: any) => <IbmWatsonKnowledgeCatalog {...params} />,
      },


    ],

  },


];
