import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const useLoginForm = () => {
    const [isLoading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);


    const objectFormSchema = z.object({
        name: z.string().min(1, { message: "Esse campo deve ser preenchido." }),
        description: z.string().min(1, { message: "Esse campo deve ser preenchido." }),
        is_archived: z.boolean(),
        hidden: z.boolean(),
        favorite: z.boolean(),
        date_created: z.string(),
        date_updated: z.string(),
        uuid: z.string(),
        library_id: z.string(),
        path: z.string(),
        tags: z.array(z.object({
            name: z.string(),
            color: z.string(),
        })),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(objectFormSchema),
    });


    const onSubmit = async (formData) => {
        console.log(formData);
    };




    //Redirect user to dashboard if he is already logged in.
    const handleLogin = async (e) => {
        setLoading(true);
        onSubmit(e);
    };

    return {
        register,
        handleSubmit,
        errors,
        handleLogin,
        isLoading, //isLoading is used to show the loading animation when the user clicks the login button.
        success, //success is used to show the success animation when the user is logged in.
        error,
        setError,
    };
};

export default useLoginForm;