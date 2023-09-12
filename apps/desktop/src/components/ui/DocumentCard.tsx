import { ProductiveCard } from "@carbon/ibm-products";
import {
	SearchResult,
	Tag,
	TagOnObject,
} from "../../../../../web/src/bindings";
import { settings } from "../../constants/settings";
import { Edit, ArrowRight } from "@carbon/icons-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Tag as TagComponent } from "@carbon/react";
import parse from "html-react-parser";
import useThemeStore from "../../Stores/themeStore";

import { useNavigate } from "react-router-dom";
import { FC, memo, useCallback } from "react";

import dayjs from "dayjs";
import relative from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br"; // import locale
import { getTagColor } from "./DocumentForm";
import useTags from "../../hooks/useTags";
import { invoke } from "@tauri-apps/api";

dayjs.extend(relative);
dayjs.locale("pt-br"); // use locale

const CardHeader = ({ title, tags }) => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			<div
				style={{
					display: "flex",
					width: "100%",
					flexDirection: "column",
					alignContent: "space-between",
				}}
			>
				<span className={`${settings.sipePrefix}--data-title-link`}>
					{title}
				</span>
				<div
					style={{
						padding: "0",
						marginTop: "5px",
						display: "flex",
						gap: "5px",
						alignContent: "flex-start",
						alignItems: "center",
					}}
				>
					{tags?.map((tag) => (
						<TagComponent
							key={tag.color}
							type={getTagColor(tag)}
							style={{ padding: "0 5px 0 5px", margin: "0" }}
						>
							{tag.name}
						</TagComponent>
					))}
				</div>
			</div>
			<div style={{ display: "flex", alignContent: "center", gap: "2px" }} />
		</div>
	);
};

interface DocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
	document: SearchResult;
	setSelectedObject: (document: SearchResult) => void;
	setOpen: (open: boolean) => void;
	open: boolean;
	tags: TagOnObject[];
}

const DocumentCard: FC<DocumentCardProps> = ({
	document,
	setSelectedObject,
	setOpen,
	open,
	tags,
	...rest
}) => {
	const { tags: allTags } = useTags();

	const getThisDocumentTags = useCallback(() => {
		const thisDocumentTags = tags.map((tag) => {
			const tagObject = allTags.find((t) => t.id === tag.tag_id);
			return { ...tagObject, ...tag };
		});
		return thisDocumentTags;
	}, [tags, allTags]);

	const { theme } = useThemeStore();
	const navigate = useNavigate();
	const handleDocumentEditClick = (document) => {
		setSelectedObject(document);
		setOpen(!open);
	};

	const extend_scope = async () => {
		try {
			if (document?.object.path !== undefined) {
				await invoke("extend_scope", { path: document?.object.path });
			}
		} catch (error) {
			console.error("Failed to extend scope:", error);
		}
	};

	const handleDocumentViewClick = async (e) => {
		e.preventDefault();
		await extend_scope().then(() => {
			navigate(`/data/${document.object.id}`);
		});
	};

	const options = {
		transform: (reactNode, domNode, index) => {
			// this will wrap every element in a div
			// we want to transform the <b> element into a span with a special class
			if (domNode.name === "b") {
				if (theme === "g100") {
					return (
						<span key={index} className="data--highlight-text--g100">
							{reactNode}
						</span>
					);
				} else {
					return (
						<span key={index} className="data--highlight-text">
							{reactNode}
						</span>
					);
				}
			} else {
				return (
					<span key={index} className="data--snippet-text">
						{reactNode}
					</span>
				);
			}
		},
	};

	return (
		<div className={`${settings.sipePrefix}--card-content-wrapper`} {...rest}>
			<ProductiveCard
				onClick={() => handleDocumentEditClick(document)}
				label={`${dayjs(document?.object.date_created).fromNow()}`}
				actionsPlacement="bottom"
				actionIcons={[
					{
						icon: (props) => <Edit {...props} />,
						iconDescription: "Editar",
						id: "1",
						onClick: () => handleDocumentEditClick(document),
					},
					{
						onClick: (e) => handleDocumentViewClick(e),
						icon: (props) => <ArrowRight {...props} />,
						iconDescription: "Ver documento...",
						id: "2",
					},
				]}
				mediaRatio={null}
				title={
					<CardHeader tags={getThisDocumentTags()} title={document?.title} />
				}
			>
				{/* {document.tags
					? getThisDocumentTags().map((tag, index) => (
							<TagComponent key={tag.color} type={getTagColor(tag)}>
								{tag.name}
							</TagComponent>
					  ))
					: null} */}
				{parse(`"${document.snippet}"`, options)}
			</ProductiveCard>
		</div>
	);
};

export default DocumentCard;
