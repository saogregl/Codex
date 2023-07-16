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
  // @ts-ignore

  Select,
  // @ts-ignore

  SelectItem,

  Form,
  Theme,
  // @ts-ignore

  InlineLoading,
} from "@carbon/react";
import { ArrowLeft } from "@carbon/react/icons";
import { plataformas } from "../../constants/plataformas";
import useRegister from "./useRegisterForm";
type Props = {};

const RegisterForm = (props: Props) => {
  const { register, handleSubmit, errors, handleRegister, isLoading, success } =
    useRegister();

  return (
    <>
      <Theme theme="white">
        <div className="outerLoginPage">
          <div className="innerLoginPage">
            <div className="loginContainer">
              <div className="loginContainer--header">
                <h2>Registrar</h2>
                <Button
                  hasIconOnly
                  renderIcon={ArrowLeft}
                  iconDescription="Retornar"
                  href="/"
                  kind="tertiary"
                />
              </div>
              <hr className="register--hr-active" />
              <h5>Informações da conta</h5>
              <Form onSubmit={handleSubmit(handleRegister)}>
                <FormGroup
                  legendText=""
                  legendId="form-group-1"
                  style={{
                    minWidth: "100%",
                  }}
                >
                  <TextInput
                    id="email"
                    labelText="Email"
                    {...register("email")}
                    invalid={errors.email ? true : false}
                    // @ts-ignore

                    invalidText={errors.email?.message}
                  />
                  <div className="register--name-input">
                    <TextInput
                      style={{ width: "100%" }}
                      id="firstName"
                      labelText="Primeiro Nome"
                      {...register("firstName")}
                      invalid={errors.firstName ? true : false}
                        // @ts-ignore

                      invalidText={errors.firstName?.message}
                    />
                    <TextInput
                      style={{ width: "100%" }}
                      id="lastName"
                      labelText="Ultimo nome"
                      {...register("lastName")}
                      invalid={errors.lastName ? true : false}
                        // @ts-ignore

                      invalidText={errors.lastName?.message}
                    />
                  </div>
                  <PasswordInput
                    labelText="Senha"
                    id="password"
                    autoComplete="true"
                    {...register("password")}
                    invalid={errors.password ? true : false}
                    invalidText={errors.password?.message}
                  />
                  <PasswordInput
                    labelText="Confirmar senha"
                    id="confirmPassword"
                    autoComplete="true"
                    {...register("confirmPassword")}
                    invalid={errors.confirmPassword ? true : false}
                    invalidText={errors.confirmPassword?.message}
                  />

                  <Stack gap={2}>
                    <Stack gap={2} orientation="horizontal">
                      <Select
                        defaultValue="Plataforma"
                        id="platform"
                        labelText="Selecione uma plataforma"
                        size="md"
                        {...register("platform")}
                      >
                        {plataformas.map((plataforma) => {
                          return (
                            <SelectItem
                              key={plataforma}
                              text={plataforma}
                              value={plataforma}
                            />
                          );
                        })}
                      </Select>
                    </Stack>

                    {isLoading ? (
                      <InlineLoading
                        style={{ marginLeft: "1rem" }}
                        description={"Registrando..."}
                        status={success ? "success" : "active"}
                      />
                    ) : (
                      <Button type="submit" size="lg">
                        Registrar
                      </Button>
                    )}
                  </Stack>
                </FormGroup>
              </Form>
            </div>
            <hr />
          </div>
        </div>
      </Theme>
    </>
  );
};

export default RegisterForm;
