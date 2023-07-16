import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../lib/supabaseClient";
import useStore from "../../Stores/sessionStore";

const useLoginForm = () => {
  const [sessionData, setSessionData] = useState(null);
  const store = useStore();
  const [isLoading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const LoginSchema = z.object({
    email: z
      .string()
      .min(1, { message: "Esse campo deve ser preenchido." })
      .email("Esse não é um email válido."),
    password: z
      .string()
      .min(8, { message: "Sua senha deve ter mais de 8 caracteres" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const handleErrorMessage = (e) => {
    if (e.message == "Invalid login credentials") {
      return "Credenciais invalidas";
    } else {
      return "Erro de login";
    }
  };

  const onSubmit = async (formData) => {
    await supabase.auth
      .signInWithPassword(formData)
      .then(({ data: user, error }) => {
        if (error) {
          setError(handleErrorMessage(error));
          setLoading(false);
          setSuccess(false);
          console.log(error);
          return;
        }
        setSessionData(user);
        // @ts-ignore-next-line
        store.setCurrentSession(user);
      });
  };

  //Check if the user is authenticated and redirects when a session is not null.
  useEffect(() => {
    if (sessionData) {
      setLoading(false);
      setSuccess(true);
      navigate("/dashboard/home");
    }
  }, [sessionData]);

  

  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
      return;
    } else {
      // @ts-ignore-next-line

      store.invalidateCurrentSession();
      setSessionData(null);
      navigate("/");
    }
  };

  //Redirect user to dashboard if he is already logged in.
  useEffect(() => {
    const getSession = async () => {
      await supabase.auth.getSession().then(({ data, error }) => {
        if (data.session) {
          // @ts-ignore-next-line

          store.setCurrentSession(data);
          navigate("/Dashboard/Home");
        }
      });
    };
    getSession();
  }, []);

  const handleLogin = async (e) => {
    setLoading(true);
    onSubmit(e);
  };

  return {
    register,
    handleSubmit,
    errors,
    handleLogin,
    handleSignout,
    isLoading, //isLoading is used to show the loading animation when the user clicks the login button.
    success, //success is used to show the success animation when the user is logged in.
    error,
    setError,
  };
};

export default useLoginForm;
