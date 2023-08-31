/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react'
import { ExpressiveCard, PageHeader, SidePanel, CreateSidePanel } from "@carbon/ibm-products"


import {
  FlexGrid,
  Row,
  Checkbox,
  Search,
  Dropdown,
  Accordion,
  AccordionItem,
  DatePicker,
  Form,
  TextArea
} from "@carbon/react"
// @ts-ignore
import { Theme, TextInput, MultiSelect, Pagination, DatePickerInput, Layer, Tag, FilterableMultiSelect, CheckboxGroup } from "@carbon/react";
import { Edit, TrashCan, ArrowRight } from "@carbon/icons-react";
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
import { CodexNotification } from '../../../../../web/src/bindings';
import useThemeStore from '../../Stores/themeStore';
import useTags from '../../hooks/useTags';
import { z } from 'zod';
import { set } from 'react-hook-form';

dayjs.extend(relative);
dayjs.locale('pt-br') // use locale


const index = () => {

  const { theme } = useThemeStore();

  //variables necessary for pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tearsheetIsOpen, setTearsheetIsOpen] = useState(false);
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("");
  const [newTag, setNewTag] = useState("");

  const {
    data: SearchResult,
    isLoading: isLoadingSearchResult,
    error: errorSearchResult,
  } = rspc.useQuery(["search.search", { query }]);

  const [paginatedSearchResult, setPaginatedSearchResult] = useState<typeof SearchResult>([]);
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


  const handleQuery = (e) => {
    const value = e.target.value;
    //Check if the event is not clear 
    if (e.target.value != "" && e.target.value != null) {
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
      SearchResult?.slice((e.page - 1) * e.pageSize, e.page * e.pageSize)
    )
  }

  const options = {
    transform: (reactNode, domNode, index) => {
      // this will wrap every element in a div
      // we want to transform the <b> element into a span with a special class
      if (domNode.name === "b") {
        if (theme == "g100") {
          return <span className='data--highlight-text--g100'>{reactNode}</span>;
        } else {
          return <span className='data--highlight-text'>{reactNode}</span>;
        }

      }
      else {
        return <span className='data--snippet-text'>{reactNode}</span>;
      }
    }
  };

  const collections = ['Collection 1', 'Collection 2', 'Collection 3'];
  const spaces = ['Space 1', 'Space 2', 'Space 3'];
  const tags = ['Tag 1', 'Tag 2', 'Tag 3'];
  const documentTypes = ['Document Type 1', 'Document Type 2', 'Document Type 3'];
  const authors = ['Author 1', 'Author 2', 'Author 3'];

  const handleFavoritesChange = (e) => {
    console.log(e)
  }


  const [selectedObject, setSelectedObject] = useState<typeof SearchResult[number]>(null);

  // const [selectedCollection, setSelectedCollection] = useState(collections[0]);
  // const [selectedSpace, setSelectedSpace] = useState(spaces[0]);
  // const [selectedDocument, setSelectedDocument] = useState(null);

  const renderCard = (document: typeof SearchResult[number]) => {
    return (
      <div className={`${settings.sipePrefix}--card-content-wrapper`}>
        <ExpressiveCard
          label={`${dayjs(document.object.date_created).fromNow()}`}
          // onClick={() => navigate(`/Data/${document.object.id}`)}
          actionIcons={[
            {
              icon: (props) => <Edit {...props} />,
              iconDescription: 'Editar',
              id: '1',
              onClick: () => { setSelectedObject(document); setOpen(!open) }
            },
            {
              href: `/Data/${document.object.id}`,
              icon: (props) => <ArrowRight {...props}/>,
              iconDescription: 'Ver documento...',
              id: '2'
            },
          ]}
          mediaRatio={null}
          title={renderCardHeader(document.title)}
          pictogram={() => { return docTags.map((tag) => (<Tag type={tag.color.toLocaleLowerCase()}>{tag.name}</Tag>)) }}

        >
          "{parse(document.snippet, options)}"
        </ExpressiveCard>
      </div>)
  }

  const { tags: docTags } = useTags();

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
      <Theme theme={theme}>
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


      <Theme theme={theme == 'g10' ? 'g100' : 'g10'}>
        <SidePanel
          includeOverlay
          className='test'
          open={open}
          onRequestClose={() => setOpen(false)}
          title='Edite o documento'
          subtitle={`Edite o documento "${selectedObject?.object.obj_name}"`}
          actions={[
            {
              label: "Editar",
              onClick: () => setOpen(false),
              kind: "primary"
            },
            {
              label: "Cancelar",
              onClick: () => setOpen(false),
              kind: "secondary"
            }
          ]}
        >
          <Form aria-label="sample form">
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', rowGap: "16px" }}>
              <TextInput defaultValue={selectedObject?.object.obj_name} id="name" labelText="Nome" />
              <TextArea defaultValue={selectedObject?.object.uuid} id="description" labelText="Descrição" />
              <CheckboxGroup legendText='Favorito' label="Favorito" title="Favorito" helperText="Selecione para marcar o documento como Favorito">
                <Checkbox labelText='Checkbox label' title="Favorito" checked={selectedObject?.object.favorite} id="favorite"  />
              </CheckboxGroup>
              <FilterableMultiSelect label="Tags" id="carbon-multiselect-example"
                titleText="Tags"
                helperText="Selecione tags para ajudar a identificar o documento" items={docTags}
                itemToElement={(tag: typeof Tag) => tag ? <Tag type={tag?.color.toLocaleLowerCase()}>{tag?.name}</Tag> : ''}
                itemToString={(tag: typeof Tag) => tag ? tag?.name : ''}
                selectionFeedback="top-after-reopen"
                onInputValueChange={(e) => setNewTag(e)}
                onMenuChange={(e) => {
                  if (e) {
                    console.log("should create new tag", newTag)
                  }
                }}
              />
            </div>
          </Form>
        </SidePanel>
      </Theme>


      <div className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}>
        <div className="height-100">
          <div className="flex-column height-100">
            <div className={`${settings.sipePrefix}--data-search-bar-wrapper`}>
              <Search labelText={''} onChange={handleQuery} defaultValue={persistentQuery} />
            </div>
            <div className="flex-row height-100">
              <div className="left-panel">
                <SearchPanel>
                  <Accordion>
                    <AccordionItem title="Tags">
                      <Dropdown label="tags" id="tags-dropdown" titleText="Selecione as Tags" helperText="Filtre os documentos por tags" items={tags} itemToString={item => item ? item : ''} />
                    </AccordionItem>
                    <AccordionItem title="Coleções">
                      <MultiSelect label="Selecione as coleções" id="collections-multiselect" titleText="Selecione as coleções" helperText="Filtre os documentos por coleções" items={collections} itemToString={item => item ? item : ''} selectionFeedback="top-after-reopen" />
                    </AccordionItem>
                    <AccordionItem title="Data">
                      <DatePicker datePickerType="range">
                        <DatePickerInput id="date-picker-input-id-start" placeholder="dd/mm/aaaa" labelText="Data de início" size="md" />
                        <DatePickerInput id="date-picker-input-id-finish" placeholder="dd/mm/aaaa" labelText="Data final" size="md" />
                      </DatePicker>
                    </AccordionItem>
                    <AccordionItem title="Tipo de Documento">
                      <Dropdown label="tags" id="doctype-dropdown" titleText="Selecione o Tipo de Documento" helperText="Filtre os documentos por tipo" items={documentTypes} itemToString={item => item ? item : ''} />
                    </AccordionItem>
                    <AccordionItem title="Autor">
                      <Dropdown label="tags" id="author-dropdown" titleText="Selecione o Autor" helperText="Filtre os documentos por autor" items={authors} itemToString={item => item ? item : ''} />
                    </AccordionItem>
                    <AccordionItem title="Favoritos">
                      <Checkbox labelText="Mostrar apenas favoritos" id="favorites-checkbox" onChange={handleFavoritesChange} />
                    </AccordionItem>
                  </Accordion>
                </SearchPanel>
              </div>
              <div className="right-panel">
                <p className={`${settings.sipePrefix}--search-panel-header-text`}>Documentos</p>
                <div className="scrollable-area">
                  {
                    paginatedSearchResult?.map((document) => (
                      renderCard(document)
                    ))
                  }
                </div>
              </div>
            </div>

          </div>
          <div className="pagination-wrapper">
            <Pagination
              backwardText="Página anterior"
              forwardText="Próxima página"
              itemsPerPageText="Itens por página:"
              itemRangeText={(min, max, total) => { return `Itens ${min}-${max} de ${total}` }}
              pageRangeText={(current, total) => { return `Página ${current} de ${total}` }}
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
        </div>
      </div>
    </div >
  )
}

export default index