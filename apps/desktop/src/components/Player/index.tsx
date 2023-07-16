//@ts-nocheck

import classnames from "classnames";
import { useEffect, useRef } from "react";
import { settings } from "../../constants/settings";
import WidgetWrapper from "../Widget";
import { Helmet } from "react-helmet";
import { useScript } from "usehooks-ts";

function Player() {
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      const script = document.createElement("script");
      const body = document.getElementsByTagName("body")[0];
      script.src = "/js/ptc/thingview/thingview.js";
      body.appendChild(script);
      script.onload = () => {
        console.log("ThingView loaded");
        let app;
        let session;
        let model;
        //@ts-ignore
        ThingView.init("/js/ptc/thingview", () => {
          startThingView();
        });
        function startThingView() {
          ThingView.SetDefaultSystemPreferences(
            Module.ApplicationType.CREOVIEW
          );
          app = ThingView.CreateCVApplication("CreoViewWebGLDiv");
          session = app.GetSession();
          session.LoadStructNodeWithURL1(
            "/sample-data/Fishing_Reel/fishing_reel.pvs",
            true,
            Module.ExpandThumbnails.COMPLETELY,
            (structNode) => {
              const shapeScene = session.MakeShapeScene(true);
              const shapeView = shapeScene.MakeShapeView(
                document.getElementById("CreoViewWebGLDiv").childNodes[0].id,
                true
              );
              shapeView.SetTopBottomBackgroundColor(0x000000ff, 0xf4f4f4ff);
              model = shapeScene.MakeModel();
              model.LoadStructNode(
                structNode,
                true,
                true,
                (success, isStructure) => {
                  console.log(
                    "Model LoadFromURLWithCallback - success: " +
                      success +
                      ", isStructure: " +
                      isStructure
                  );
                }
              );
              // Clean up local reference to ThingView objects after finishing using them.
              shapeScene.delete();
              shapeView.delete();
            }
          );
        }
      };
    }
    return () => {
      effectRan.current = true;
    };
  }, []);

  return (
    <>
      <WidgetWrapper title="SIPE" subtitle="Visualizador de modelos 3D">
        <div
          id="CreoViewWebGLDiv"
          className="CreoViewWebGLDiv"
          style={{ width: "100%", height: "619px" }}
        ></div>
      </WidgetWrapper>
    </>
  );
}
export default Player;
