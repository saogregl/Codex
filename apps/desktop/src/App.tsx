/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from "react";
import { createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";
import { useEffect } from "react";
import type { Procedures } from "../../../web/src/bindings"; // These were the bindings exported from your Rust code!

import {
  // @ts-ignore
  Button,
} from "@carbon/react";


function App() {
  const client = createClient<Procedures>({
    transport: new TauriTransport(),
  });



  return (
    <div className="container">

      <div style={{ display: "flex", padding: "64px", margin: "64px" }}>
      </div>
    </div>
  );
}

export default App;
