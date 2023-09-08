import React, { useState } from "react";
import { Form, TextInput, TextArea, Checkbox, Theme } from "@carbon/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CheckboxGroup, FilterableMultiSelect, Tag } from "@carbon/react";

import { SidePanel } from "@carbon/ibm-products";
import { SearchResult, Tag as CodexTag } from "../../../../../web/src/bindings";
import useThemeStore from "../../Stores/themeStore";

interface DocumentFormProps {
	selectedObject: SearchResult;
	docTags: CodexTag[];
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const getTagColor = (tag: CodexTag) => {
	switch (tag?.color.toLocaleLowerCase()) {
		case "blue":
			return "blue";
		case "green":
			return "green";
		case "purple":
			return "purple";
		case "magenta":
			return "magenta";
		case "teal":
			return "teal";
		case "red":
			return "red";
		case "gray":
			return "gray";
		case "cool-gray":
			return "cool-gray";
		case "cyan":
			return "cyan";
		case "warm-gray":
			return "warm-gray";
		case "high-contrast":
			return "high-contrast";
		case "outline":
			return "outline";
		default:
			return "cool-gray";
	}
}


const DocumentForm = ({
	selectedObject,
	docTags,
	open,
	setOpen,
}: DocumentFormProps) => {



	const [newTag, setNewTag] = useState("");
	const { theme } = useThemeStore();

	return (
		<Theme theme={theme === "g10" ? "g100" : "g10"}>
			<SidePanel
				includeOverlay
				className="test"
				open={open}
				onRequestClose={() => setOpen(false)}
				title="Edite o documento"
				subtitle={`Edite o documento "${selectedObject?.object.obj_name}"`}
				actions={[
					{
						label: "Editar",
						onClick: () => setOpen(!open),
						kind: "primary",
					},
					{
						label: "Cancelar",
						onClick: () => setOpen(false),
						kind: "secondary",
					},
				]}
			>
				<Form aria-label="sample form">
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							rowGap: "16px",
						}}
					>
						<TextInput
							defaultValue={selectedObject?.object.obj_name}
							id="name"
							labelText="Nome"
						/>
						<TextArea
							defaultValue={selectedObject?.object.uuid}
							id="description"
							labelText="Descrição"
						/>
						<CheckboxGroup
							legendText="Favorito"
							label="Favorito"
							title="Favorito"
							helperText="Selecione para marcar o documento como Favorito"
						>
							<Checkbox
								labelText="Favorito"
								title="Favorito"
								checked={selectedObject?.object.favorite}
								id="favorite"
							/>
						</CheckboxGroup>
						<FilterableMultiSelect
							label="Tags"
							id="carbon-multiselect-example"
							titleText="Tags"
							helperText="Selecione tags para ajudar a identificar o documento"
							items={docTags}
							itemToElement={(tag: CodexTag) =>
								tag ? (
									<Tag type={getTagColor(tag)}>{tag?.name}</Tag>
								) : (
									""
								)
							}
							itemToString={(tag: CodexTag) => (tag ? tag?.name : "")}
							selectionFeedback="top-after-reopen"
							onInputValueChange={(e) => setNewTag(e)}
							onMenuChange={(e) => {
								if (e) {
									console.log("should create new tag", newTag);
								}
							}}
						/>
					</div>
				</Form>
			</SidePanel>
		</Theme>
	);
};

export default DocumentForm;
