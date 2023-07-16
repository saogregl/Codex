import React, { useState } from 'react'
import { ExpressiveCard, ProductiveCard, PageHeader, SidePanel } from "@carbon/ibm-products"
import { Grid, FlexGrid, Row, Column } from "@carbon/react"
// @ts-ignore
import { Theme, Tab, Tabs, TabList, TabPanels, TabPanel, Button } from "@carbon/react";
import classnames from "classnames";
import { settings } from '../../constants/settings';
import { Edit, TrashCan } from "@carbon/icons-react"
import { AreaChartExample } from '../../components/ChartTest'
import DataGridComponent from '../../components/Datagrid/DataGridComponent';
import { ICA } from '../../components/ICA';
type Props = {}

const index = (props: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [open, setOpen] = useState(false)
  const action = () => {
    console.log("action");
  };

  const keyPerformanceIndicators = [
    {
      title: "Índice de soluções de engenharia",
      value: 76,
      percentage: true,
      truncate: false
    },
    {
      title: "Ocorrência em análise de causa-raiz",
      value: 54,
      percentage: false,
      truncate: false

    },
    {
      title: "Ocorrências nível 4",
      value: 2,
      percentage: false,
      truncate: false

    },
    {
      title: "Ocorrências em validação",
      value: 50,
      percentage: false,
      truncate: false

    }
  ]
  const defaultProps = {
    title: "GOP",
    label: "Lumina 500",
    actionIcons: [
      {
        id: "1",
        icon: (props) => <Edit size={16} {...props} />,
        onClick: () => setOpen(!open),
        onKeyDown: action,
        iconDescription: "Edit"
      },
      {
        id: "2",
        icon: (props) => <TrashCan size={16} {...props} />,
        onClick: action,
        onKeyDown: action,
        iconDescription: "Delete"
      }
    ]
  };



  const renderProjectItems = () => {
    return (
      <ProductiveCard
        {...defaultProps}    >
        <div className={`${settings.sipePrefix}_card_content_wrapper`}>

          <DataGridComponent />

          <p>
            Productive content text
          </p>
        </div>

      </ProductiveCard >
    )
  }

  const renderCard = () => {
    return (<ProductiveCard
      {...defaultProps}    >
      <div className={`${settings.sipePrefix}_card_content_wrapper`}>
        <AreaChartExample />
        <AreaChartExample />

      </div>
    </ProductiveCard>
    )
  }

  const renderICA = (index: number) => {
    return (<ProductiveCard
      {...defaultProps}    >
      <div className={`${settings.sipePrefix}_small_card_content_wrapper`}>
        <ICA label={keyPerformanceIndicators[index].title} value={keyPerformanceIndicators[index].value} percentage={keyPerformanceIndicators[index].percentage} truncate={keyPerformanceIndicators[index].truncate} />

      </div>
    </ProductiveCard>
    )

  }

  return (
    <div>
      <Theme theme="g10">
        <PageHeader
          actionBarOverflowAriaLabel="Mostrar outras ações"
          fullWidthGrid
          allTagsModalSearchLabel="Pesquisar todas as tags"
          allTagsModalSearchPlaceholderText="Digite o termo de pesquisa"
          allTagsModalTitle="Todas as tags"
          breadcrumbOverflowAriaLabel="Abrir e fechar lista de itens de rota de navegação adicionais."
          breadcrumbs={[
            {
              href: "/Dashboard",
              key: "Breadcrumb 1",
              label: "Dashboard",
            },
          ]}
          collapseHeaderIconDescription="Recolher o cabeçalho da página"
          expandHeaderIconDescription="Expandir o cabeçalho da página"
          pageActionsOverflowLabel="Mostrar mais ações da página"
          showAllTagsLabel="Mostrar todas as tags"
          title={"Home"}
          subtitle={
            "Aqui você pode acompanhar as atualizações e o status do projeto em tempo real."
          }
          navigation={
            <Tabs
              selectedIndex={selectedTab}
              onChange={(e) => setSelectedTab(e.selectedIndex)}
            >
              <TabList aria-label="Opções de navegação">
                <Tab
                  aria-label="Status do andamento do projeto"
                  title="Status do andamento do projeto"
                >
                  Resumo
                </Tab>
                <Tab>Minhas atividades</Tab>

                <Tab>Notícias</Tab>
                <Tab
                  aria-label="Status do andamento do negócio"
                  title="Status do andamento do negócio"
                >
                  Status do negócio
                </Tab>
              </TabList>
            </Tabs>
          }
        />
      </Theme>

      <div

        className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}
      >
        <Theme theme="g90">

          <SidePanel
            includeOverlay
            className='test'
            open={open}
            onRequestClose={() => setOpen(false)}
            title='Incident management'
            subtitle='Testing subtitle text.'
            actions={[
              {
                label: "Submit",
                onClick: () => setOpen(false),
                kind: "primary"
              },
              {
                label: "Cancel",
                onClick: () => setOpen(false),
                kind: "secondary"
              }
            ]}
          >
          </SidePanel>
        </Theme>

        <FlexGrid condensed fullWidth>

          <Row condensed>


            <Column lg={4}>{renderICA(0)}</Column>
            <Column lg={4}>{renderICA(1)}</Column>
            <Column lg={4}>{renderICA(2)}</Column>
            <Column lg={4}>{renderICA(3)}</Column>

          </Row>
          <Row>
            <Column lg={10}>{renderProjectItems()}</Column>
            <Column lg={6}>{renderCard()}</Column>

          </Row>

        </FlexGrid>
      </div>
    </div>
  )
}

export default index