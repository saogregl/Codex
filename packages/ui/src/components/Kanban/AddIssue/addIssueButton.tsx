import {
  // @ts-ignore

  Button,
  Form,
  TextInput,
  DatePicker,
  // @ts-ignore

  DatePickerInput,
  // @ts-ignore

  Layer,
  // @ts-ignore

  MultiSelect,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import classnames from "classnames";
import { settings } from "../../../constants/settings";
import { useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { Controller } from "react-hook-form";
import useAddIssue from "./hooks/useAddIssue";

type Props = {
  listID: string;
};

const addIssueButton = ({ listID }: Props) => {
  const {
    errors,
    handleSubmit,
    isLoading,
    onSubmit,
    register,
    control,
    isOpen,
    setIsOpen,
  } = useAddIssue({
    listID,
  });

  const ref = useRef(null);

  useClickOutside(
    ref,
    () => {
      //Check if click is on the button

      if (isOpen) {
        setIsOpen(false);
      }
    },
    ["sipe--kanban-add-button"]
  );

  const expandAddIssue = () => {
    setIsOpen(!isOpen);
  };

  const baseClassname = settings.sipePrefix + "--addIssue-container";
  const hiddenClassname = baseClassname + "--hidden";
  const addIssueClass = isOpen
    ? baseClassname
    : baseClassname + " " + hiddenClassname;

  return (
    <>
      <Button
        onClick={expandAddIssue}
        className={classnames(`${settings.sipePrefix}--kanban-add-button`)}
        hasIconOnly
        renderIcon={(props: JSX.IntrinsicAttributes) => (
          <Add size={22} {...props} />
        )}
        iconDescription="Adicionar nova tarefa"
      />
      <div id={settings.sipePrefix}>
        <div
          className={addIssueClass}
          style={{
            visibility: isOpen ? "visible" : "hidden",
            height: isOpen ? "300px" : "0",
            transition:
              "height 0.1s ease-in-out 0s, visibility 0.1s ease-in-out 0s",
          }}
          ref={ref}
        >
          <div className={baseClassname + "-content"}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Layer>
                <TextInput
                  id="title"
                  labelText="Título"
                  placeholder="Digite um título para a tarefa"
                  invalid={!!errors.title}
                  invalidText={errors.title?.message}
                  {...register("title")}
                />
                <Controller
                  name="date"
                  control={control}
                  render={({
                    field: { onChange, onBlur, ref },
                    fieldState: { invalid, error },
                    formState,
                  }) => {
                    return (
                          // @ts-ignore
                      <DatePicker
                        //{...components.DatePicker}
                        datePickerType="range"
                        onChange={onChange}
                        onBlur={onBlur}
                        invalid={invalid}
                        invalidText={error?.message}
                      >
                        <DatePickerInput
                          id="startDate"
                          placeholder="mm/dd/yyyy"
                          labelText="Data de início"
                        />
                        <DatePickerInput
                          id="endDate"
                          placeholder="mm/dd/yyyy"
                          labelText="Data final"
                        />
                      </DatePicker>
                    );
                  }}
                />

                <Controller
                  name="assignedMembers"
                  control={control}
                  render={({
                    field: { onChange, onBlur, ref },
                    fieldState: { invalid, error },
                    formState,
                  }) => {
                    return (
                      <MultiSelect
                        itemToString={(item) => (item ? item.text : "")}
                        items={[
                          {
                            id: "Lucas Silva",
                            text: "Lucas Silva",
                          },
                        ]}
                        onChange={onChange}
                        onBlur={onBlur}
                        invalid={invalid}
                        invalidText={error?.message}
                        label="Selecione os responsáveis"
                        titleText="Responsáveis"
                        size="md"
                      />
                    );
                  }}
                />
              </Layer>
              <div
                className={classnames(
                  `${settings.sipePrefix}--kanban-add-button-container`
                )}
              >
                <Button type="submit">
                  <div
                    className={classnames(
                      `${settings.sipePrefix}--kanban-add-button-content`
                    )}
                  >
                    Adicionar
                  </div>
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default addIssueButton;
