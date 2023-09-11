import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import rspc, { queryClient } from "../lib/query";

interface IUseCollectionsFormProps {
	collection_id: number;
	closeTearsheet: () => void;
}

const useCollectionsForm = ({
	collection_id,
	closeTearsheet,
}: IUseCollectionsFormProps) => {
	const {
		isLoading: editCollectionLoading,
		mutateAsync,
		isError,
	} = rspc.useMutation("collections.edit_collection_by_id");

	const [isLoading, setLoading] = useState(false);
	const [successfullEdit, setSuccessfullEdit] = useState(null);

	const CollectionSchema = z.object({
		name: z
			.string()
			.min(1, { message: "O nome da coleção não pode ser vazio." }),
		description: z
			.string()
			.min(8, { message: "a descrição deve ter mais de 8 caracteres" }),
	});

	type FormData = z.infer<typeof CollectionSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(CollectionSchema),
	});

	const onSubmit = async (formData: FormData) => {
		await mutateAsync(
			{
				id: collection_id,
				name: formData.name,
				description: formData.description,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries(["collections.get_all_collections"]);
					setSuccessfullEdit(true);
					setLoading(false);
					setSuccessfullEdit(null);
					closeTearsheet();
				},
				onError: () => {
					setSuccessfullEdit(false);
					setLoading(false);
				},
			},
		);
	};

	const handleEditCollection = async (e) => {
		setLoading(true);
		onSubmit(e);
	};

	return {
		register,
		handleSubmit,
		errors,
		handleEditCollection,
		isLoading,
		successfullEdit,
	};
};

export default useCollectionsForm;
