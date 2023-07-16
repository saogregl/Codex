import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import rspc, { queryClient } from "../../../../lib/query";
import type { AddTaskToColumnArgs } from "../../../../../web/src/bindings";

const useAddIssue = ({ listID }) => {
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: addNewTaskToColumn } = rspc.useMutation(
    "tasks.addNewTaskToColumn"
  );

  function handleIssueCreate(args: AddTaskToColumnArgs) {
    addNewTaskToColumn(args, {
      onError(error, variables, context) {
        console.log("Error creating issue", error);
      },
      onSuccess: () => {
        //Invalidate the query to refetch the list
        queryClient.invalidateQueries([
          "tasks.getTasksFromList",
          { list_id: listID },
        ]);
        setLoading(false);
      },
    });
  }
  const addIssueSchema = z.object({
    title: z.string().min(1, { message: "Esse campo deve ser preenchido." }),
    date: z.array(z.date()).optional(),
    assignedMembers: z
      .object({
        selectedItems: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          })
        ),
      })
      .optional(),
  });

  type addIssueSchemaType = z.infer<typeof addIssueSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset
  } = useForm<addIssueSchemaType>({
    resolver: zodResolver(addIssueSchema),
  });

  const onSubmit = async (formData) => {
    setLoading(true);
    setIsOpen(false);

    console.log(formData);

    
    handleIssueCreate({
      Project_id: 1,
      list_id: listID,
      title: formData.title,
      description: "new issue",
      status: "incomplete",
    });
    reset();
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    control,
    isOpen, 
    setIsOpen //isLoading is used to show the loading animation when the user clicks the addIssue button.
  };
};

export default useAddIssue;
