/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import { Form, TextInput, TextArea, Checkbox, Theme } from "@carbon/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CheckboxGroup, FilterableMultiSelect, Tag } from "@carbon/react";

import { SidePanel } from "@carbon/ibm-products";
import { SearchResult, Tag as CodexTag } from "../../../../../web/src/bindings";
import useThemeStore from "../../Stores/themeStore";
import useTags from "../../hooks/useTags";
import rspc, { queryClient } from "../../lib/query";
import useEditDocumentForm from "../../hooks/useEditDocumentForm";
import { Controller } from "react-hook-form";

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
};

const DocumentForm = ({
	selectedObject,
	docTags,
	open,
	setOpen,
}: DocumentFormProps) => {
	const { addTagUnchecked, isAddingTag, addTagError, tags } = useTags();
	const getObjectTagsFromIds = (tagIds: number[]) => {
		const tags = docTags.filter((tag) => tagIds.includes(tag.id));
		return tags;
	};

	const handleNewTagCreate = async (newTag: string) => {
		//Select a random color from the list of colors
		const colors = [
			"blue",
			"green",
			"purple",
			"magenta",
			"teal",
			"red",
			"gray",
			"cool-gray",
			"cyan",
			"warm-gray",
			"high-contrast",
			"outline",
		];
		const randomColor = colors[Math.floor(Math.random() * colors.length)];

		//Check if the tag already exists
		const tagExists = docTags.find((tag) => tag.name === newTag);

		if (tagExists) {
			return;
		}

		setNewTag("");

		const tag = await addTagUnchecked(
			{
				name: newTag,
				color: randomColor,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries(["tags.get_tags"]);
				},
				onError: () => {
					console.log("error creating tag");
				},
			},
		);
	};

	const [newTag, setNewTag] = useState("");
	const { theme } = useThemeStore();
	const closeCallback = () => {
		setOpen(false);
	};
	const {
		handleSubmit,
		control,
		reset,
		handleEditDocument,
		errors,
		isLoading,
		register,
		successfullEdit,
	} = useEditDocumentForm({
		selectedObject: selectedObject,
		objectId: selectedObject?.object.id,
		closeCallback,
	});

	return (
		<Theme theme={theme === "g10" ? "g100" : "g10"}>
			<SidePanel
				includeOverlay
				className="test"
				animateTitle={true}
				open={open}
				onRequestClose={() => {
					reset();
					setOpen(false);
				}}
				title="Edite o documento"
				subtitle={`Edite o documento "${selectedObject?.object.obj_name}"`}
				actions={[
					{
						label: "Editar",
						onClick: handleSubmit(handleEditDocument),
						kind: "primary",
						loading: isLoading,
					},
					{
						label: "Cancelar",
						onClick: () => setOpen(false),
						kind: "secondary",
					},
				]}
			>
				<Form
					aria-label="sample form"
					onSubmit={handleSubmit(handleEditDocument)}
				>
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
							helperText="Por padrão, o nome do documento é o nome do arquivo, mas você pode alterá-lo aqui"
							{...register("name")}
							invalid={errors.name ? true : false}
							// @ts-ignore
							invalidText={errors.name?.message}
						/>
						<TextArea
							defaultValue={
								selectedObject?.object.description
									? selectedObject?.object.description
									: "Descrição do documento"
							}
							id="description"
							labelText="Descrição"
							{...register("description")}
							invalid={errors.description ? true : false}
							// @ts-ignore
							invalidText={errors.description?.message}
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
								defaultChecked={selectedObject?.object.favorite}
								id="favorite"
								{...register("favorite")}
								invalid={errors.favorite ? true : false}
								// @ts-ignore
								invalidText={errors.favorite?.message}
							/>
						</CheckboxGroup>

						<Controller
							name="tags"
							control={control}
							render={({
								field: { onChange, onBlur, ref },
								fieldState: { invalid, error },
								formState,
							}) => {
								return (
									<FilterableMultiSelect
										label="Tags"
										id="tags"
										titleText="Tags"
										helperText="Selecione tags para ajudar a identificar o documento"
										items={docTags}
										initialSelectedItems={getObjectTagsFromIds(
											selectedObject?.tags.map((tag) => tag.tag_id),
										)}
										itemToElement={(tag: CodexTag) =>
											tag ? <Tag type={getTagColor(tag)}>{tag?.name}</Tag> : ""
										}
										itemToString={(tag: CodexTag) => (tag ? tag?.name : "")}
										selectionFeedback="top-after-reopen"
										onInputValueChange={(e) => {
											setNewTag(e);
										}}
										onChange={onChange}
										onBlur={onBlur}
										invalid={invalid}
										invalidText={errors.tags?.message}
										onMenuChange={(e) => {
											if (e) {
												if (
													newTag !== "" &&
													newTag !== undefined &&
													newTag.length > 3
												) {
													handleNewTagCreate(newTag);
												}
											}
										}}
									/>
								);
							}}
						/>
					</div>
				</Form>
			</SidePanel>
		</Theme>
	);
};

export default DocumentForm;
