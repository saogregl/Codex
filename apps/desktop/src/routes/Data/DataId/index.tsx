/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState } from 'react'
import { PageHeader } from "@carbon/ibm-products"
// @ts-ignore
import { Theme } from "@carbon/react";
import classnames from "classnames";
import { settings } from '../../../constants/settings';
import rspc from '../../../lib/query';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br' // import locale
import StarRating from '../../../components/StarRating/StarRating';
import { useParams } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { invoke } from "@tauri-apps/api"

dayjs.extend(relative);
dayjs.locale('pt-br') // use locale



const index = () => {

    const { id } = useParams();
    const id_number = parseInt(id)





    const {
        data: object,
        isLoading: isLoadingObjects,
        error: errorObjects,
    } = rspc.useQuery(["library.get_doc_by_id", { id: id_number }]);

    useEffect(() => {
        const extend_scope = async () => {
            if (object?.path) {
                const data = await invoke('extend_scope', { path: object.path });
            }

        }
        extend_scope()
    }, [object])

    console.log(object?.path)


    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }




    // const [selectedCollection, setSelectedCollection] = useState(collections[0]);
    // const [selectedSpace, setSelectedSpace] = useState(spaces[0]);
    // const [selectedDocument, setSelectedDocument] = useState(null);



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
                        {
                            href: id,
                            key: "Breadcrumb 2",
                            label: object ? object.obj_name : "Data",
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
                />
            </Theme>

            <div
                className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}
            >

                <div style={{ height: "100%" }}>
                    {object && object.path && <object className={`${settings.sipePrefix}--pdf-viewer-wrapper`} data={convertFileSrc(object.path)}>
                    </object>
                    }

                </div >
            </div >
        </div >

    )
}



export default index