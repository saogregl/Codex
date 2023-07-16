import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const useRegister = () => {
  const [isLoading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const RegisterSchema = z
    .object({
      email: z
        .string()
        .min(1, { message: "Esse campo é obrigatório." })
        .email("Este não é um email válido."),
      password: z
        .string()
        .min(8, { message: "Sua senha deve ter mais de 8 caracteres" }),
      confirmPassword: z
        .string()
        .min(8, { message: "Sua senha deve ter mais de 8 caracteres" }),
      firstName: z.string().min(1, { message: "Esse campo é obrigatório." }),
      lastName: z.string().min(1, { message: "Esse campo é obrigatório." }),
      platform: z.string().min(1, { message: "Esse campo é obrigatório." }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não são iguais.",
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  useEffect(() => {
    if (success) {
      navigate("/");
    }
  }, [success]);

  const onSubmit = async (formData) => {
    await supabase.auth
      .signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            platform: formData.platform,
          },
        },
      })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          console.log(error);
          return;
        }
        console.log(data)
        setSuccess(true);
      });
  };

  const handleRegister = async (e) => {
    setLoading(true);
    onSubmit(e);
  };

  return {
    register,
    handleSubmit,
    errors,
    handleRegister,
    isLoading,
    success,
  };
};

export default useRegister;
