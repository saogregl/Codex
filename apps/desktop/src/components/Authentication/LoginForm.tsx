import {
  // @ts-ignore
  Button,
  TextInput,
  // @ts-ignore
  Stack,
  // @ts-ignore

  FormGroup,
  // @ts-ignore

  PasswordInput,
  Form,
  Theme,
  // @ts-ignore
  InlineLoading,
  // @ts-ignore

  InlineNotification,
} from "@carbon/react";
import useStore from "../../Stores/sessionStore";

import useLoginForm from "./useLoginForm";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

type Props = {};

const LoginForm = (props: Props) => {
  const {
    register,
    handleSubmit,
    errors,
    handleLogin,
    handleSignout,
    isLoading,
    success,
    error,
    setError,
  } = useLoginForm();


  const store = useStore();



  return (
    <>
      <Theme theme="white">
        <div className="outerLoginPage">
          <div className="innerLoginPage">
            <div className="loginContainer">
              <h2>Login</h2>
              {error && (
                <InlineNotification
                  aria-label="closes notification"
                  onCloseButtonClick={() => setError(null)}
                  statusIconDescription="notification"
                  subtitle={error}
                  title=""
                />
              )}
              <Form onSubmit={handleSubmit(handleLogin)}>
                <FormGroup
                  legendText=""
                  legendId="form-group-1"
                  style={{
                    width: "100%",
                  }}
                >
                  <Stack gap={2}>
                    <TextInput
                      id="email"
                      labelText="Email"
                      type="email"
                      {...register("email")}
                    />
                    <PasswordInput
                      id="password"
                      labelText="Senha"
                      autoComplete="true"
                      type="password"
                      {...register("password")}
                    />
                    {isLoading ? (
                      <InlineLoading
                        style={{ marginLeft: "1rem" }}
                        description={"Autenticando..."}
                        status={success ? "success" : "active"}
                      />
                    ) : (
                      <Button
                        type="submit"
                        size="lg"
                        style={{ width: "100%", maxWidth: "none" }}
                      >
                        Login
                      </Button>
                    )}
                  </Stack>
                </FormGroup>
              </Form>
            </div>
            <hr />

            <div className="socialLogins">
              {Object.keys(
                // @ts-ignore-next-line
                store.userSession
              ).length != 0 ? (
                <div>

                  <Button
                    onClick={handleSignout}
                    disabled={isLoading}
                    size={"lg"}
                  >
                    Logout
                  </Button>

                </div>

              ) :
                <Button
                  href="/register"
                  disabled={isLoading}
                  style={{ width: "100%", maxWidth: "none" }}
                >
                  Registrar
                </Button>}
            </div>
          </div>
        </div>
      </Theme>
    </>
  );

};

export default LoginForm;
