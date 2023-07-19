import React, { useState } from 'react'
import { ExpressiveCard, ProductiveCard, PageHeader, SidePanel, CreateSidePanel } from "@carbon/ibm-products"
import { Grid, FlexGrid, Row, Column, Checkbox } from "@carbon/react"
// @ts-ignore
import { Theme, Tab, Tabs, TabList, TabPanels, TabPanel, Button, TextInput, NumberInput, Dropdown } from "@carbon/react";
import classnames from "classnames";
import { settings } from '../../constants/settings';
import { Edit, TrashCan } from "@carbon/icons-react"
import { AreaChartExample } from '../../components/ChartTest'
import DataGridComponent from '../../components/Datagrid/DataGridComponent';
import { ICA } from '../../components/ICA';
type Props = {}

const index = (props: Props) => {
  const [tearsheetIsOpen, setTearsheetIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [open, setOpen] = useState(false)
  const action = () => {
    console.log("action");
  };

  const defaultProps = {
    title: "Projetos recentes",
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
        </div>
      </ProductiveCard >
    )
  }

  const renderCard = () => {
    return (<ProductiveCard
      {...defaultProps}    >
      <div className={`${settings.sipePrefix}_card_content_wrapper`}>

      </div>
    </ProductiveCard>
    )
  }

  const renderProject = (index: number) => {
    return (

      <ProductiveCard
        {...defaultProps}>
        <div className={`${settings.sipePrefix}_small_card_content_wrapper`}>
          <ICA label={"lorem ipsum"}></ICA>
          <ICA label={"lorem ipsum"}></ICA>
          <ICA label={"lorem ipsum"}></ICA>

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
          title={"Bem vindo, Lucas!"}
          subtitle={
            "Aqui você pode acompanhar as atualizações mais recentes nos dados."
          }
          pageActions={[
            {
              label: "Inserir novo documento",
              onClick: () => setTearsheetIsOpen(!tearsheetIsOpen),
              kind: "primary"
            },
          ]}

        // navigation={
        //   <Tabs
        //     selectedIndex={selectedTab}
        //     onChange={(e) => setSelectedTab(e.selectedIndex)}
        //   >
        //     <TabList aria-label="Opções de navegação">
        //       <Tab
        //         aria-label="Status do andamento do projeto"
        //         title="Status do andamento do projeto"
        //       >
        //         Resumo
        //       </Tab>
        //       <Tab>Minhas atividades</Tab>

        //       <Tab>Notícias</Tab>
        //       <Tab
        //         aria-label="Status do andamento do negócio"
        //         title="Status do andamento do negócio"
        //       >
        //         Status do negócio
        //       </Tab>
        //     </TabList>
        //   </Tabs>
        // }
        />
      </Theme>

      <div

        className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}
      >
        <Theme theme="g90">
          <CreateSidePanel
            formDescription="We recommend you fill out and evaluate these details at a minimum before deploying your object."
            formTitle="Object configuration"
            onRequestClose={() => setTearsheetIsOpen(false)}
            onRequestSubmit={function noRefCheck() { }}
            primaryButtonText="Create"
            secondaryButtonText="Cancel"
            selectorPageContent="#sipe--main-content-wrapper"
            selectorPrimaryFocus=".cds--text-input"
            subtitle="Specify the details of your object."
            title="Create object"
            open={tearsheetIsOpen}
          >
            <Checkbox
              id="object-hidden-checkbox"
              labelText="Hidden"
              onChange={(e) => console.log(e)}
            />
            <Checkbox
              id="object-favorite-checkbox"
              labelText="Favorite"
              onChange={(e) => console.log(e)}
            />
            <Checkbox
              id="object-important-checkbox"
              labelText="Important"
              onChange={(e) => console.log(e)}
            />
            <TextInput
              id="object-note-textarea"
              labelText="Note"
              onChange={(e) => console.log(e)}
              placeholder="Enter a note"
            />

          </CreateSidePanel>

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

        <div className={classnames(`${settings.sipePrefix}--Content-header-container`)}
        >
          <h2>Visão Geral</h2>
        </div>
        <FlexGrid fullWidth>
          <Row >
            <Column lg={4} md={8}><div>
              {renderProject(0)}{renderProject(0)}{renderProject(0)}{renderProject(0)}</div></Column>
            <Column lg={4} md={8}><div>
              {renderProject(0)}{renderProject(0)}{renderProject(0)}</div></Column>
            <Column lg={4} md={8}><div>
              {renderProject(0)}{renderProject(0)}</div></Column>
            <Column lg={4} md={8}><div>
              {renderProject(0)}{renderProject(0)}{renderProject(0)}{renderProject(0)}</div></Column>
          </Row>

        </FlexGrid>
      </div>
    </div>
  )
}

export default index