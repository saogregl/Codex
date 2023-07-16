import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const ProjectSchema = z.object({
  projectTemplate: z
    .string()
    .min(1, { message: "Esse campo deve ser preenchido." }),
  projectName: z
    .string()
    .min(1, { message: "Esse campo deve ser preenchido." }),
  projectDescription: z
    .string()
    .min(1, { message: "Esse campo deve ser preenchido." }),
  projectWorkflow: z
    .string()
    .min(1, { message: "Esse campo deve ser preenchido." }),
  Teste: z.string().min(1, { message: "Esse campo deve ser preenchido." }),
});

type FormData = z.infer<typeof ProjectSchema>;

const useCreateProject = () => {
  const [open, setOpen] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm<FormData>({
    resolver: zodResolver(ProjectSchema),
    mode: "onBlur",
  });

  const onSubmit = async (formData) => {
    console.log(formData);
  };

  //Check if the user is authenticated and redirects when a session is not null.

  return {
    register,
    handleSubmit,
    errors,
    open,
    setOpen,
    hasSubmitError,
    setHasSubmitError,
    reset,
    clearErrors
  };
};

export default useCreateProject;
