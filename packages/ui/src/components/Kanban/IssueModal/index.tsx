import {
  // @ts-ignore

  Modal,
  // @ts-ignore

  Select,
  DatePicker,
  // @ts-ignore

  DatePickerInput,

  Checkbox,
  // @ts-ignore

  Button,
  // @ts-ignore

  ContentSwitcher,
  // @ts-ignore

  Switch,
  // @ts-ignore

  Accordion,
  // @ts-ignore

  AccordionItem,
  Form,
} from "@carbon/react";
import { Attachment, Add } from "@carbon/react/icons";
import Comment from "../Comment";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settings } from "../../../constants/settings";
import classnames from "classnames";
import rspc, { client, queryClient } from "../../../lib/query";
import { useClickOutside } from "../../../hooks/useClickOutside";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/pt-br' // import locale

dayjs.extend(relativeTime);
dayjs.locale('pt-br') // use locale

type IssueModalProps = {
  open: boolean;
};

interface task {
  created_at: string | null;
  project_id: number | null;
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  id: string;
  assigned: string | null;
  createdBy: string | null;
  list: number | null;
  Position: number | null;
  order_type: string | null;
}

export const IssueModal = (props: IssueModalProps) => {
  const { taskId } = useParams();
  const [historyContext, setHistoryContext] = useState(false);
  const [commentsContext, setcommentsContext] = useState(true);



  const {
    data: task,
    isLoading,
    error,
  } = rspc.useQuery(["tasks.getTaskByID", { task_id: taskId }]);

  const taskSchema = z.object({
    title: z.string().min(1, { message: "Esse campo deve ser preenchido." }),
    description: z
      .string()
      .min(1, { message: "Esse campo deve ser preenchido." }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title,
      description: task?.description,
    },
  });

  useEffect(() => {
    reset({ title: task?.title, description: task?.description });
  }, [isLoading]);

  const navigate = useNavigate();

  const panelATitleNode = <h5>Detalhes</h5>;
  const panelBTitleNode = <h5>Outros campos</h5>;

  const { mutate: editIssueMutation, isSuccess } =
    rspc.useMutation("tasks.EditTaskByID");

  useEffect(() => {
    if (isSuccess) {
      navigate(-1);
    }
  }, [isSuccess]);

  const hasTaskChanged = (e) => {
    if (e.title !== task.title || e.description !== task.description) {
      return true;
    }
    return false;
  };

  function handleTaskChange(e) {
    const EditTaskByIDArgs = {
      workspace_id: task.projectID,
      task_id: task.id,
      title: e.title,
      description: e.description,
      due_date: null,
      priority: null,
      status: "BACKLOG",
      position: task.position,
    };

    console.log(
      "check if task has changed: ",
      hasTaskChanged(EditTaskByIDArgs)
    );

    //Check if the task has changed before doing the mutation:
    if (hasTaskChanged(EditTaskByIDArgs)) {
      editIssueMutation(EditTaskByIDArgs, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["tasks.getTasksFromList"],
          });
          queryClient.invalidateQueries({
            queryKey: ["tasks.getTaskByID"],
          });
        },
      });
    } else {
      navigate(-1);
    }
  }

  return (
    <Modal
      open={props.open}
      modalHeading=""
      modalLabel=""
      passiveModal
      size="lg"
      onRequestClose={handleSubmit((e) => {
        handleTaskChange(e);
      })}
    >
      <Form onSubmit={handleSubmit(handleTaskChange)} autoFocus={false}>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "16px",
              alignItems: "flex-start",
              width: "50%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center",
                paddingBottom: "16px",
                width: "100%",
              }}
            >
              <div style={{ maxWidth: "20px", marginRight: "20px" }}>

                <Checkbox id="checkbox-label-1" labelText={""} />
              </div>
              <input
                className={classnames(
                  `${settings.sipePrefix}--issue-modal-title-input`
                )}
                defaultValue={task?.title}
                id={"title"}
                {...register("title")}
                tabIndex={-1}
              ></input>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <Button renderIcon={Attachment} size="sm" kind="secondary">
                Anexar
              </Button>
              <Button renderIcon={Add} size="sm" kind="secondary">
                Criar Subtarefa
              </Button>
            </div>

            <div style={{ width: "100%" }}>
              <div style={{ backgroundColor: "white", padding: "16px 0px" }}>
                <h6>Descrição</h6>
                <input
                  type={"text"}
                  id={"description"}
                  defaultValue={task?.description}
                  className={classnames(
                    `${settings.sipePrefix}--issue-modal-description-input`
                  )}
                  {...register("description")}
                  tabIndex={-1}
                ></input>
              </div>
            </div>
            <div style={{ width: "100%", padding: "16px 0px" }}>
              <div style={{ backgroundColor: "white" }}>
                <h6>Atividade</h6>
                <div
                  style={{
                    gap: "5px",
                    alignItems: "center",
                    padding: "16px 0px",
                    width: "45%",
                  }}
                >
                  <ContentSwitcher
                    selectionMode="manual"
                    onChange={(obj) => {
                      const { index } = obj;
                      if (index === 0) {
                        setHistoryContext(false);
                        setcommentsContext(true);
                      }
                      if (index === 1) {
                        setHistoryContext(true);
                        setcommentsContext(false);
                      }
                    }}
                    size="sm"
                  >
                    <Switch name="one" text="Comentários" />
                    <Switch name="two" text="Histórico" />
                  </ContentSwitcher>
                </div>
              </div>
              {commentsContext && <Comment />}
            </div>
          </div>
          <div
            style={{ borderLeft: "1px solid #F4F4F4", height: "500px" }}
          ></div>

          <div
            className="issue-secondary-column"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "16px",
              alignItems: "flex-start",
              width: "40%",
            }}
          >
            <Accordion align="start">
              <AccordionItem title={panelATitleNode}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: "5px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <h6>Responsável</h6>
                    <p>Teste</p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <h6>Membros</h6>
                    <p>Teste</p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <h6>Etiquetas</h6>
                    <p>Teste</p>
                  </div>

                  <div style={{ width: "100%" }}>
                    <h6 style={{ paddingBottom: "16px" }}>Datas</h6>

                    <DatePicker datePickerType="range" allowInput={false} appendTo={undefined} className={""} closeOnSelect={false} inline={false} invalid={false} invalidText={""} light={false} warnText={""}>
                      <DatePickerInput
                        id="date-picker-input-id-start"
                        placeholder="dd/mm/yyyy"
                        labelText="Data de inicio"
                        size="sm"
                        locale="pt"
                      />
                      <DatePickerInput
                        id="date-picker-input-id-finish"
                        placeholder="dd/mm/yyyy"
                        labelText="Data final"
                        size="sm"
                        locale="pt"
                      />
                    </DatePicker>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title={panelBTitleNode}>Panel B</AccordionItem>
            </Accordion>
            <div
              className={classnames(`${settings.sipePrefix}--created-in-text`)}
            >
              Criado {dayjs(task?.createdAt).fromNow()}
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
