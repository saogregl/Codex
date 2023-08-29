/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react'
import { ProductiveCard, PageHeader, } from "@carbon/ibm-products"
import { FlexGrid, Row, Column, Button } from "@carbon/react"
// @ts-ignore
import { Theme, TextInput, Modal, ContentSwitcher, Switch } from "@carbon/react";
import classnames from "classnames";
import { settings } from '../../constants/settings';
import { Edit, TrashCan, Db2Database, DocumentAdd } from "@carbon/icons-react"
import { ICA } from '../../components/ICA';
import ActionHeader from '../../components/ui/actionHeader';
import { z } from "zod";
import { openDirectoryDialog } from '../../utils/file';
import rspc from '../../lib/query';
import useLibraries from '../../hooks/useLibraries';
import useThemeStore from '../../Stores/themeStore';
// Open a selection dialog for directories

// const selected = await open({
//   directory: true,
//   multiple: true,
//   defaultPath: await appDir(),
// });


const index = () => {
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [isCollectionNameInvalid, setIsCollectionNameInvalid] = useState(false);


  const [open, setOpen] = useState(false)
  const action = () => {
    console.log("action");
  };

  const onOpenDirectoryDialog = async () => {
    const selected = await openDirectoryDialog();
    setSelectedDirectory(selected);
  }
  const { libraries } = useLibraries();


  const { mutate } = rspc.useMutation("library.add_new_location");

  const requestSubmit = async () => {

    setCreateModalIsOpen(false);

    await mutate({
      library_id: libraries[0].uuid,
      name: collectionName,
      path: selectedDirectory,
      is_archived: false,
      hidden: false,
      date_created: new Date().toISOString()
    });
  }

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

  const renderDocument = (index: number) => {
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
  // export type AddNewLocation = { library_id: string; name: string; path: string; is_archived: boolean; hidden: boolean; date_created: string }

  const taskSchema = z.object({
    name: z.string().min(1, { message: "Esse campo deve ser preenchido." }),
    path: z.instanceof(File)
  });

  const { theme } = useThemeStore();

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
              href: "/Dashboard",
              key: "Breadcrumb 1",
              label: "Dashboard",
            },

          ]}
          collapseHeaderIconDescription="Recolher o cabeçalho da página"
          expandHeaderIconDescription="Expandir o cabeçalho da página"
          pageActionsOverflowLabel="Mostrar mais ações da página"
          showAllTagsLabel="Mostrar todas as tags"
          title={"Gerencie arquivos"}
          subtitle={
            "Prepare coleções com seus documentos para iniciar."
          }
        />
      </Theme>
      <div
        className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}
      >
        <Theme theme={(theme == "g100" ? "g10" : "g100")}>
          <Modal
            open={createModalIsOpen}
            modalHeading="Crie uma nova coleção"
            modalLabel="A coleção é um conjunto de documentos que serão analisados juntos."
            size="sm"
            onRequestClose={() => setCreateModalIsOpen(!createModalIsOpen)}
            primaryButtonText="Criar coleção"
            secondaryButtonText="Cancelar"
            primaryButtonDisabled={!collectionName || !selectedDirectory || isCollectionNameInvalid}
            onRequestSubmit={(e) => requestSubmit()}
          >
            <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
              <TextInput
                id="1"
                labelText="Digite o nome da coleção"
                placeholder="Minha coleção"
                onChange={(e) => setCollectionName(e.target.value)}
                invalid={isCollectionNameInvalid}
                invalidText="Nome da coleção inválido"
              />
              <Button onClick={onOpenDirectoryDialog}>Selecionar o diretório</Button>
              {selectedDirectory && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <DocumentAdd />
                  <p className={classnames(`${settings.sipePrefix}--document-selected`)}>{selectedDirectory}</p>
                </div>
              )}
            </div>
          </Modal>
        </Theme>
        <ActionHeader actions={[
          {
            id: "1",
            title: "Coleção de documentos",
            icon: DocumentAdd,
            onClick: () => setCreateModalIsOpen(!open),
          },
          {
            id: "2",
            title: "Conectar fonte de dados",
            icon: Db2Database,
            onClick: () => setCreateModalIsOpen(!open),
          },
        ]} />
        <FlexGrid fullWidth>
          <Row>
            <div className={classnames(`${settings.sipePrefix}--home-header-container`)}>
              <ContentSwitcher onChange={function noRefCheck() { }}>
              <Switch
                name="favorites"
                text="Favoritos"
              />
              <Switch
                name="two"
                text="Recomendados"
              />
            </ContentSwitcher>
            </div>
          </Row>
          <Row >
            <Column lg={4} md={8}>
              <div>
                {renderDocument(0)}
              </div>
            </Column>
            <Column lg={4} md={8}><div>
              {renderDocument(0)}</div></Column>
            <Column lg={4} md={8}><div>
              {renderDocument(0)}</div></Column>
            <Column lg={4} md={8}><div>
              {renderDocument(0)}</div></Column>
          </Row>
        </FlexGrid>
      </div>
    </div>
  )
}

export default index