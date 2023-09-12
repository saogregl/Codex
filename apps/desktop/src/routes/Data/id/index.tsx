/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import { PageHeader } from "@carbon/ibm-products";
// @ts-ignore
import { Theme } from "@carbon/react";
import classnames from "classnames";
import { settings } from "../../../constants/settings";
import rspc from "../../../lib/query";
import dayjs from "dayjs";
import relative from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br"; // import locale
import { useParams } from "react-router-dom";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { invoke } from "@tauri-apps/api";
import useThemeStore from "../../../Stores/themeStore";
import { defaultPageHeaderProps } from "../../../constants/defaultPageHeader";
import { PDFViewer } from "../../../components/PDFViewer";

dayjs.extend(relative);
dayjs.locale("pt-br"); // use locale

const index = () => {
	const { id } = useParams();
	const id_number = parseInt(id);
	const { theme } = useThemeStore();
	const [Mounted, setMounted] = useState(true);

	const { data: object, isFetched } = rspc.useQuery([
		"library.get_doc_by_id",
		{ id: id_number },
	]);

	useEffect(() => {
		const extend_scope = async () => {
			try {
				if (object?.path !== undefined) {
					await invoke("extend_scope", { path: object.path });
				}
			} catch (error) {
				console.error("Failed to extend scope:", error);
			}
		};

		extend_scope();
	}, [object, isFetched]);

	return (
		<div>
			<Theme theme={theme}>
				<PageHeader
					{...defaultPageHeaderProps}
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
					title={"Bem vindo, Lucas!"}
					subtitle={"Aqui você pode buscar seus documentos."}
				/>
			</Theme>
			<div
				className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}
			>
				<div style={{ height: "100%", width: "100%" }}>
					{object?.path && <PDFViewer src={convertFileSrc(object?.path)} />}
				</div>
			</div>
		</div>
	);
};

export default index;
