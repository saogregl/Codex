import React, { useEffect, useState } from 'react'
import { Documentation } from "@carbon/pictograms-react"
import { ProductiveCard, ExpressiveCard, PageHeader, SidePanel, CreateSidePanel } from "@carbon/ibm-products"
import { FlexGrid, Row, Column, Checkbox, Section, Heading, AspectRatio, Search, Dropdown, Accordion, AccordionItem } from "@carbon/react"
// @ts-ignore
import { Theme, TextInput, Select, SelectItem, MultiSelect, Layer, Pagination } from "@carbon/react";
import classnames from "classnames";
import { settings } from '../../constants/settings';
import { Edit, TrashCan, DataView as View } from "@carbon/icons-react"
import { ICA } from '../../components/ICA';
import rspc from '../../lib/query';
import DataGridComponent from '../../components/Datagrid/DataGridComponent';
import SearchPanel from '../../components/SearchPanel/SearchPanel';
import parse, { attributesToProps } from 'html-react-parser';
import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br' // import locale

dayjs.extend(relative);
dayjs.locale('pt-br') // use locale

type Props = {}

const index = (props: Props) => {
  const [tearsheetIsOpen, setTearsheetIsOpen] = useState(false);
  const [recommendedDocuments, setRecommendedDocuments] = useState([]); // Use appropriate logic to fetch recommended documents

  const [open, setOpen] = useState(false)

  const [query, setQuery] = useState("teste");

  const {
    data: SearchResult,
    isLoading: isLoadingSearchResult,
    error: errorSearchResult,
  } = rspc.useQuery(["search.search", { query }]);



  const options = {
    transform: (reactNode, domNode, index) => {
      // this will wrap every element in a div
      // we want to transform the <b> element into a span with a special class
      if (domNode.name === "b") {
        return <span className='data--highlight-text'>{reactNode}</span>;
      }
      else {
        return reactNode;
      }

    }
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
  } = rspc.useQuery(["library.get_all_objects"]);

  useEffect(() => {
    setRecommendedDocuments(
      objects?.slice(0, 4)
    )
  }, [objects])



  const collections = ['Collection 1', 'Collection 2', 'Collection 3'];
  const spaces = ['Space 1', 'Space 2', 'Space 3'];
  const documents = ['Document 1', 'Document 2', 'Document 3']; // Replace with your documents data

  const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  const [selectedSpace, setSelectedSpace] = useState(spaces[0]);
  const [selectedDocument, setSelectedDocument] = useState(null);



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
          collapseTitle
          showAllTagsLabel="Mostrar todas as tags"
          title={"Bem vindo, Lucas!"}
          subtitle={
            "Aqui você pode acompanhar as atualizações nos documentos da empresa."
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

        <FlexGrid fullWidth condensed>
          {/* <Section level={3}>
            <Heading>Documentos recomendados</Heading>
          </Section> */}
          <Row>
            <div className={`${settings.sipePrefix}--data-search-bar-wrapper`}>
              <Search labelText={''} onChange={(e) => setQuery(e.target.value)} />

            </div>


            <Column lg={4} md={2}>

              <SearchPanel>

                <Accordion>

                  <AccordionItem title="Tags">

                    <Dropdown id="default" titleText="Dropdown label" helperText="This is some helper text" label="Dropdown menu options" items={collections} itemToString={item => item ? item : ''} />
                  </AccordionItem>
                  <AccordionItem title="Coleções">

                    <MultiSelect label="Multiselect Label" id="carbon-multiselect-example" titleText="Multiselect title" helperText="This is helper text" items={spaces} itemToString={item => item ? item : ''} selectionFeedback="top-after-reopen" />
                  </AccordionItem>

                </Accordion>

              </SearchPanel>


            </Column>

            <Column lg={12} md={2}>


              <p className={`${settings.sipePrefix}--search-panel-header-text`}>Documentos</p>

              <div style={{ overflow: "auto", maxHeight: "100vh" }}>

                {
                  SearchResult?.map((document) => (

                    <div className={`${settings.sipePrefix}--card-content-wrapper`}>

                      <ExpressiveCard
                        label={`${dayjs(document.object.date_created).fromNow()}`}
                        mediaRatio={null}
                        title={document.title}
                      >
                        {parse(document.snippet, options)}
                      </ExpressiveCard>
                    </div>


                  ))
                }
              </div>

            </Column>

          </Row>
          <Row>
            <Pagination
              backwardText="Previous page"
              forwardText="Next page"
              itemsPerPageText="Items per page:"
              onChange={function noRefCheck() { }}
              page={1}
              pageSize={10}
              pageSizes={[
                10,
                20,
                30,
                40,
                50
              ]}
              size="md"
              totalItems={103}
            />

          </Row>

        </FlexGrid>
      </div>
    </div>
  )
}



export default index