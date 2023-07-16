import { useState } from "react";
import { createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";
import { useEffect } from "react";
import type { Procedures } from "../web/src/bindings"; // These were the bindings exported from your Rust code!

import {
  // @ts-ignore
  Button,
} from "@carbon/react";

import { CreateProject } from "@codex/ui/src/components/Flow/CreateProject";
import { useCreateProject } from "@codex/ui/src/components/Flow/CreateProject";

function App() {
  const client = createClient<Procedures>({
    transport: new TauriTransport(),
  });

  const {
    register,
    handleSubmit,
    errors,
    open,
    setOpen,
    hasSubmitError,
    setHasSubmitError,
    reset,
    clearErrors
  } = useCreateProject();
  const [workspaceActivities, setWorkspaceActivities] = useState("");

  useEffect(() => {
    client.query(["tasks.getAllProjectActivities"]).then((res) => {
      setWorkspaceActivities(JSON.stringify(res));
    });
  }, []);

  return (
    <div className="container">
      <Button onClick={() => setOpen(!open)}>
        {open ? "Close CreateTearsheet" : "Open CreateTearsheet"}
      </Button>

      <div style={{ display: "flex", padding: "64px", margin: "64px" }}>
        <CreateProject
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          open={open}
          setOpen={setOpen}
          hasSubmitError={hasSubmitError}
          setHasSubmitError={setHasSubmitError}
          reset={reset}
          clearErrors={clearErrors}
        />
      </div>
    </div>
  );
}

export default App;
