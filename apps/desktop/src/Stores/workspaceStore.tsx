import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { Workspace, Project } from '../../web/src/bindings';
import rspc, { queryClient } from "../lib/query";
import type { AddTaskToColumnArgs } from "../../web/src/bindings";




export const getWorkspaces = async () => {
    const { data, isLoading, error } = rspc.useQuery([
        "workspaces.getWorkspaces"
    ]);
    return { data, isLoading, error };
}

export const getProjects = async () => {
    const { data, isLoading, error } = rspc.useQuery([
        "projects.getProjects"
    ]);
    return { data, isLoading, error };
}



export type ProjectContext = {
    selectedWorkspace: Workspace;
    selectedProject: Project;
};



export interface ProjectContextStore {


    projectContext: ProjectContext;
    actions: {
        resetContext: () => void;
        setWorkspace: (workspace: Workspace) => void;
        setProject: (project: Project) => void;
    };
}

export const useProjectContextStore = create<ProjectContextStore>((set, get) => ({
    projectContext: {
        selectedWorkspace: {
            id: "",
            created_at: "",
            workspace_name: "",
            workspace_description: "",
            workspace_workflow: ""
        },
        selectedProject: {
            id: 0,
            created_at: "",
            name: "",
            platform: "",
            order_type: "",
            workspace_id: "",
        },
    },

    actions: {
        resetContext: () => {
            set({
                projectContext: {
                    selectedWorkspace: {
                        id: "",
                        created_at: "",
                        workspace_name: "",
                        workspace_description: "",
                        workspace_workflow: ""
                    },
                    selectedProject: {
                        id: 0,
                        created_at: "",
                        name: "",
                        platform: "",
                        order_type: "",
                        workspace_id: "",
                    },
                }
            })
        }
        ,
        setWorkspace: (workspace: Workspace) => {
            set({
                projectContext: {
                    selectedWorkspace: workspace,
                    selectedProject: get().projectContext.selectedProject,
                }
            })
        }
        ,
        setProject: (project: Project) => {
            set({
                projectContext: {
                    selectedWorkspace: get().projectContext.selectedWorkspace,
                    selectedProject: project,
                }
            })
        }
        ,
        setContext: (availableWorkspaces: Workspace[], availableProjects: Project[]) => {
            set({
                projectContext: {
                    selectedWorkspace: get().projectContext.selectedWorkspace,
                    selectedProject: get().projectContext.selectedProject,
                }
            })
        },
    },
}));

export const useProjectContextActions = () => useProjectContextStore(state => state.actions);


