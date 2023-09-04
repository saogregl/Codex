import React, { useState } from "react";
import { Form, TextInput, TextArea, Checkbox, Theme } from "@carbon/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CheckboxGroup, FilterableMultiSelect, Tag } from "@carbon/react";

import { SidePanel } from "@carbon/ibm-products";
import { SearchResult } from "../../../../../web/src/bindings";
import useThemeStore from "../../Stores/themeStore";

interface DocumentFormProps {
	selectedObject: SearchResult;
	docTags: Tag[];
	open: boolean;
	setOpen: (open: boolean) => void;
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
							itemToElement={(tag: typeof Tag) =>
								tag ? (
									<Tag type={tag?.color.toLocaleLowerCase()}>{tag?.name}</Tag>
								) : (
									""
								)
							}
							itemToString={(tag: typeof Tag) => (tag ? tag?.name : "")}
							selectionFeedback="top-after-reopen"
							onInputValueChange={(e) => setNewTag(e)}
							onMenuChange={(e) => {
								if (e) {
                                    // TODO: create new tag
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
