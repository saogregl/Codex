/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react'
import { ExpressiveCard, PageHeader, SidePanel, CreateSidePanel } from "@carbon/ibm-products"
import { FlexGrid, Row, Column, Checkbox, Search, Dropdown, Accordion, AccordionItem } from "@carbon/react"
// @ts-ignore
import { Theme, TextInput, MultiSelect, Pagination } from "@carbon/react";
import { Edit, TrashCan } from "@carbon/icons-react";
import classnames from "classnames";
import { settings } from '../../constants/settings';
import rspc from '../../lib/query';
import SearchPanel from '../../components/SearchPanel/SearchPanel';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br' // import locale
import StarRating from '../../components/StarRating/StarRating';
import { useNavigate } from 'react-router-dom';
import useQueryParamStore from '../../Stores/searchStore';

dayjs.extend(relative);
dayjs.locale('pt-br') // use locale


const index = () => {

  const navigate = useNavigate();

  //variables necessary for pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [tearsheetIsOpen, setTearsheetIsOpen] = useState(false);
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("");

  const {
    data: SearchResult,
    isLoading: isLoadingSearchResult,
    error: errorSearchResult,
  } = rspc.useQuery(["search.search", { query }]);

  const [paginatedSearchResult, setPaginatedSearchResult] = useState<unknown[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setTotalItems(SearchResult?.length)
  }, [SearchResult])


  useEffect(() => {
    setPaginatedSearchResult(
      SearchResult?.slice(0, pageSize)
    )
  }, [SearchResult])

  // On first render we should check if the query is not empty and search: 
  useEffect(() => {
    if (persistentQuery != "") {
      setQuery(persistentQuery)
    }
  }, [])


  const debounceRef = useRef(null);

  const { persistentQuery, setPersistentQuery } = useQueryParamStore();
  console.log(persistentQuery)


  const handleQuery = (e) => {
    const value = e.target.value;
    //Check if the event is not clear 
    if (e.target.value != "" && e.target.value != null){
      setPersistentQuery(e.target.value)
    }


    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setQuery(value);
    }, 300); // 300ms is the delay after which setQuery will be called
  };

  const handlePaginateChange = (e: { page: number; pageSize: number }) => {
    setCurrentPage(e.page);
    setPageSize(e.pageSize);
    setPaginatedSearchResult(
      SearchResult?.slice((e.page - 1) * e.pageSize, e.page * e.pageSize) as unknown[]
    )
  }

  const options = {
    transform: (reactNode, domNode, index) => {
      // this will wrap every element in a div
      // we want to transform the <b> element into a span with a special class
      if (domNode.name === "b") {
        return <span className='data--highlight-text'>{reactNode}</span>;
      }
      else {
        return <span className='data--snippet-text'>{reactNode}</span>;
      }
    }
  };

  // const {
  //   data: libraries,
  //   isLoading: isLoadingLibraries,
  //   error: errorLibraries,
  // } = rspc.useQuery(["library.get_all_libraries"]);

  // const {
  //   data: objects,
  //   isLoading: isLoadingObjects,
  //   error: errorObjects,
  // } = rspc.useQuery(["library.get_all_objects"]);


  const collections = ['Collection 1', 'Collection 2', 'Collection 3'];
  const spaces = ['Space 1', 'Space 2', 'Space 3'];

  // const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  // const [selectedSpace, setSelectedSpace] = useState(spaces[0]);
  // const [selectedDocument, setSelectedDocument] = useState(null);

  const renderCard = (document: any) => {
    return (
      <div className={`${settings.sipePrefix}--card-content-wrapper`}>
        <ExpressiveCard
          // label={`${dayjs(document.object.date_created).fromNow()}`}
          onClick={() => navigate(`/Data/${document.object.id}`)}
          mediaRatio={null}
          title={renderCardHeader(document.title)}
          actionIcons={[
            {
              icon: Edit,
              iconDescription: 'Edit',
              id: '1',
            },
            {
              icon: TrashCan,
              iconDescription: 'Delete',
              id: '2',
            }
          ]}
          actionsPlacement="top"
          primaryButtonText="Ver Documento"
        >
          {parse(document.snippet, options)}
        </ExpressiveCard>
      </div>)
  }

  const renderCardHeader = (title: string) => {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", width: "100%" }}>
          <span className={`${settings.sipePrefix}--data-title-link`}>{title}</span>
        </div>
        <div style={{ display: "flex", alignContent: "center", gap: "2px" }}>
        </div>
      </div>)
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
              href: "/Data",
              key: "Breadcrumb 1",
              label: "Data",
            },
          ]}
          collapseHeaderIconDescription="Recolher o cabeçalho da página"
          expandHeaderIconDescription="Expandir o cabeçalho da página"
          pageActionsOverflowLabel="Mostrar mais ações da página"
          collapseTitle
          showAllTagsLabel="Mostrar todas as tags"
          title={"Bem vindo, Lucas!"}
          subtitle={
            "Aqui você pode buscar seus documentos."
          }
          pageActions={[
            {
              label: "Inserir novo documento",
              onClick: () => setTearsheetIsOpen(!tearsheetIsOpen),
              kind: "primary"
            },
          ]}

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

        <div style={{ height: "100%" }}>

          <FlexGrid fullWidth condensed>
            <Row>
              <div className={`${settings.sipePrefix}--data-search-bar-wrapper`}>
                <Search labelText={''} onChange={handleQuery} defaultValue={persistentQuery} />
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
              <Column lg={12} md={6} >
                <p className={`${settings.sipePrefix}--search-panel-header-text`}>Documentos</p>
                <div style={{ overflow: "scroll", height: "auto", maxHeight: "70%" }}>
                  {
                    paginatedSearchResult?.map((document) => (
                      renderCard(document)
                    ))
                  }
                </div>

              </Column>


            </Row>
            <div style={{ display: "flex", position: "absolute", bottom: "0", width: "100%", paddingRight: "96px" }}>

              <Pagination
                backwardText="Página anterior"
                forwardText="Próxima página"
                itemsPerPageText="Itens por página:"
                onChange={handlePaginateChange}
                page={currentPage}
                pageSize={pageSize}
                pageSizes={[
                  5,
                  10,
                  15,
                  20,
                ]}
                size="lg"
                totalItems={totalItems}
              />
            </div>
          </FlexGrid>
        </div>

      </div>
    </div >
  )
}



export default index