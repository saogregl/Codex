import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import rspc, { queryClient } from "../lib/query";
import { SearchResult } from "../../../../web/src/bindings";

interface IEditObjectFormProps {
	selectedObject: SearchResult;
	objectId: number;
	closeCallback: () => void;
}

const useEditDocumentForm = ({
	selectedObject,
	objectId,
	closeCallback,
}: IEditObjectFormProps) => {
	const { mutateAsync: editObject, isLoading: editObjectLoading } =
		rspc.useMutation("objects.edit_object");

	const { mutateAsync: addTagToObject, isLoading: addTagLoading } =
		rspc.useMutation("tags.add_tag_to_object");

	const [isLoading, setLoading] = useState(false);
	const [successfullEdit, setSuccessfullEdit] = useState(null);

	const ObjectSchema = z.object({
		name: z
			.string()
			.min(1, { message: "O nome do objeto não pode ser vazio." }),
		description: z
			.string()
			.min(8, { message: "a descrição deve ter mais de 8 caracteres" }),
		favorite: z.boolean(),
		tags: z.object({
			selectedItems: z.array(
				z.object({
					id: z.number(),
					uuid: z.string(),
					name: z.string(),
					color: z.string(),
					redundancy_goal: z.null(),
					date_created: z.string().nullish(),
					date_modified: z.string().nullish(),
					tag_Objects: z.null(),
				}),
			),
		}),
	});

	type FormData = z.infer<typeof ObjectSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		reset,
	} = useForm({
		resolver: zodResolver(ObjectSchema),
	});

	const updateTags = async (formData: FormData) => {
		const currentTagIds = selectedObject.tags.map((tag) => tag.tag_id);
		const newTagIds = formData.tags.selectedItems.map((tag) => tag.id);

		// Find tags that should be removed (exist in current but not in new)
		const tagsToRemove = currentTagIds.filter(
			(tagId) => !newTagIds.includes(tagId),
		);

		// Find tags that should be added (exist in new but not in current)
		const tagsToAdd = newTagIds.filter(
			(tagId) => !currentTagIds.includes(tagId),
		);

		for (const tagId of tagsToRemove) {
			await addTagToObject(
				{
					object_id: objectId,
					tag_id: tagId,
					remove_tag: true,
				},
				{
					onSuccess: () => {
						console.log("tag removed from object");
					},
					onError: () => {
						console.log("error removing tag from object");
					},
				},
			);
		}

		for (const tagId of tagsToAdd) {
			await addTagToObject(
				{
					object_id: objectId,
					tag_id: tagId,
					remove_tag: false,
				},
				{
					onSuccess: () => {
						console.log("tag added to object");
					},
					onError: () => {
						console.log("error adding tag to object");
					},
				},
			);
		}
	};

	const onSubmit = async (formData: FormData) => {
		await updateTags(formData);

		await editObject(
			{
				object_id: objectId,
				name: formData.name,
				description: formData.description,
				favorite: formData.favorite,
			},
			{
				onSuccess: () => {
					setSuccessfullEdit(true);
					setLoading(false);
					reset();
				},
				onError: () => {
					setSuccessfullEdit(false);
					setLoading(false);
				},
			},
		);
	};

	const handleEditDocument = async (e) => {
		console.log(errors);

		setLoading(true);
		onSubmit(e)
			.catch((err) => {
				console.log(err);
				setLoading(false);
			})
			.finally(() => {
				closeCallback();
				queryClient.invalidateQueries(["search.search"]);
				queryClient.invalidateQueries(["tags.get_tags"]);
			});
	};

	return {
		register,
		reset,
		control,
		handleSubmit,
		handleEditDocument,
		errors,
		isLoading,
		successfullEdit,
	};
};

export default useEditDocumentForm;
