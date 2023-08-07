import React, { useState } from 'react'
import { ProductiveCard, PageHeader, SidePanel, CreateSidePanel } from "@carbon/ibm-products"
import { FlexGrid, Row, Column, Checkbox } from "@carbon/react"
// @ts-ignore
import { Theme, TextInput } from "@carbon/react";
import classnames from "classnames";
import { settings } from '../../constants/settings';
import { Edit, TrashCan } from "@carbon/icons-react"
import { ICA } from '../../components/ICA';
import rspc from '../../lib/query';
type Props = {}

const index = (props: Props) => {
  const [tearsheetIsOpen, setTearsheetIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [open, setOpen] = useState(false)
  const action = () => {
    console.log("action");
  };

  const {
    data: libraries,
    isLoading: isLoadingLibraries,
    error: errorLibraries,
  } = rspc.useQuery(["library.get_all_libraries"]);

  const {
    data: objects,
    isLoading: isLoadingObjects,
    error: errorObjects,
  } = rspc.useQuery(["library.get_all_libraries"]);



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

            <h1>Libraries</h1>
            {JSON.stringify(libraries)}
            <h1>Objects</h1>
            {JSON.stringify(objects)}

          </Row>

        </FlexGrid>
      </div>
    </div>
  )
}

export default index