import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import rspc, { queryClient } from "../lib/query";
import useLibraries from "./useLibraries";

const useCreateLocationForm = () => {
	const {
		isLoading: addNewLocationLoading,
		mutateAsync,
		isError,
	} = rspc.useMutation("collections.add_new_location");

	const { libraries } = useLibraries();
	const [isLoading, setLoading] = useState(false);
	const [successfullCreate, setSuccessfullCreate] = useState(null);

	const LocationSchema = z.object({
		name: z
			.string()
			.min(1, { message: "O nome da coleção não pode ser vazio." }),
		description: z
			.string()
			.min(8, { message: "a descrição deve ter mais de 8 caracteres" }),
		path: z.string().min(1, { message: "O caminho não pode ser vazio." }),
	});

	type FormData = z.infer<typeof LocationSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(LocationSchema),
	});

	const onSubmit = async (formData: FormData) => {
		await mutateAsync(
			{
				collection_id: 1,
				name: formData.name,
				path: formData.path,
				is_archived: false,
				hidden: false,
				date_created: new Date().toISOString(),
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries([
						"locations.get_all_locations_for_collection",
					]);
					setSuccessfullCreate(true);
					setLoading(false);
				},
				onError: () => {
					setSuccessfullCreate(false);
					setLoading(false);
				},
			},
		);
	};

	const handleCreateLocation = async (e) => {
		setLoading(true);
		onSubmit(e);
	};

	return {
		register,
		handleSubmit,
		handleCreateLocation,
		errors,
		isLoading,
		successfullCreate,
	};
};

export default useCreateLocationForm;
