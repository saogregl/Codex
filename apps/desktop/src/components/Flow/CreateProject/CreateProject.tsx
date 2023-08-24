/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Procedures } from "../../../../../../web/src/bindings"; // These were the bindings exported from your Rust code!
import { useClickOutside } from "../../../hooks/useClickOutside";
import { Theme } from "@carbon/react"
import {
  Column,
  // @ts-ignore

  InlineNotification,
  Row,
  TextInput,
  // @ts-ignore

  Select, Form, FormGroup,
  // @ts-ignore

  SelectItem,
} from "@carbon/react";
import { CreateTearsheet, CreateTearsheetStep } from "@carbon/ibm-products";
import { useRef, useState } from "react";

const CreateProject = ({
  register,
  handleSubmit,
  errors,
  open,
  setOpen,
  hasSubmitError,
  setHasSubmitError,
  reset,
  clearErrors
}) => {
  const blockClass = `exp--tearsheet-create-multi-step`;

  const projectTemplates = ["Stage Gate", "Modern Agile", "Stage Gate Agile"];

  const projectWorkflows = [
    "Strict Design Review Workflow",
    "Design Review Workflow",
  ];
  const [simulatedDelay] = useState(750);
  const [shouldReject, setShouldReject] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const onSubmit = (data, e) => console.log(data, e);
  const onError = (errors, e) => console.log(errors, e);
  const handleFormClose = (e) => {

    setOpen(false);
    reset();
    clearErrors();
    setHasSubmitError(false)

  };



  return (
    <div className="container">
      <div style={{ display: "flex", padding: "64px", margin: "64px" }}>
        <Theme>
          <CreateTearsheet
            className={blockClass}
            submitButtonText="Criar"
            cancelButtonText="Cancelar"
            backButtonText="Anterior"
            nextButtonText="Próximo"
            description="Especifique os detalhes do novo projeto"
            label="Gerenciamento de projetos"
            title="Criar novo projeto"
            verticalPosition="lower"
            influencerWidth="narrow"
            open={open}
            onClose={handleFormClose}
            onSubmit={handleSubmit(onSubmit)}
            onRequestSubmit={() => handleSubmit(onSubmit)()}
            selectorPrimaryFocus="#projectName"
          >
            <CreateTearsheetStep
              onNext={() => {
                return new Promise<void>((resolve, reject) => {
                  setTimeout(() => {
                    // Example usage of how to prevent the next step if some kind
                    // of error occurred during the `onNext` handler.
                    if (Object.keys(errors).length === 1) {
                      setHasSubmitError(true);
                      reject("Simulated error");
                    }
                    setIsInvalid(false);
                    resolve();
                  }, simulatedDelay);
                });
              }}
              title="Novo Projeto"
              disableSubmit={false}
              description="A descrição será utilizado para o reconhecimento do projeto por multiplas equipes."
            >
              <FormGroup>

                <TextInput
                  labelText="Nome do projeto"
                  id="projectName"
                  placeholder="Nome do projeto"
                  {...register("projectName")}
                  invalid={errors?.projectName ? true : false}
                  invalidText={errors.projectName?.message}
                  className="projectName"
                  style={{
                    marginBottom: '1em'
                  }}
                />
                <TextInput
                  labelText="Descrição do projeto (opcional)"
                  id="projectDescription"
                  {...register("projectDescription")}
                  invalid={errors?.projectDescription ? true : false}
                  invalidText={errors.projectDescription?.message}
                  placeholder="Digite a descrição do projeto"
                  style={{
                    marginBottom: '1em'
                  }}

                />
                <Select
                  defaultValue="projectTemplate"
                  id="projectTemplate"
                  labelText="Selecione um template"
                  size="md"
                  {...register("projectTemplate")}
                >
                  {projectTemplates.map((projectTemplate) => {
                    return (
                      <SelectItem
                        key={projectTemplate}
                        text={projectTemplate}
                        value={projectTemplate}
                      />
                    );
                  })}
                </Select>

                <Select
                  defaultValue="projectWorkflow"
                  id="projectWorkflow"
                  labelText="Selecione um Workflow"
                  size="md"
                  {...register("projectWorkflow")}
                >
                  {projectWorkflows.map((projectWorkflow) => {
                    return (
                      <SelectItem
                        key={projectWorkflow}
                        text={projectWorkflow}
                        value={projectWorkflow}
                      />
                    );
                  })}
                </Select>
              </FormGroup>


              {hasSubmitError && (
                <InlineNotification
                  kind="error"
                  title="Erro"
                  subtitle="Resolva os erros para submeter"
                  onClose={() => setHasSubmitError(false)}
                />
              )}
            </CreateTearsheetStep>
            <CreateTearsheetStep
              title="Anexos do projeto"
              fieldsetLegendText="Anexos do projeto"
              disableSubmit={false}
              description="A descrição será utilizado para o reconhecimento do projeto por multiplas equipes."
            >
              <TextInput
                labelText="Teste"
                id="Teste"
                placeholder="Teste"
                {...register("Teste")}
                invalid={errors?.Teste ? true : false}
              // onChange={(event) => {
              //   if (event.target.value.length) {
              //     setIsInvalid(false);
              //   }
              //   setStepOneTextInputValue(event.target.value);
              // }}
              // invalid={isInvalid}
              // invalidText="Este é um campo requerido"
              // onBlur={() => {
              //   if (!stepOneTextInputValue.length) {
              //     setIsInvalid(true);
              //   }
              // }}
              />
            </CreateTearsheetStep>

          </CreateTearsheet>
        </Theme>

      </div>
    </div>
  );
};
export default CreateProject;
