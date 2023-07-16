import classnames from "classnames";
import React from "react";
import WidgetWrapper from "../../Widget";
// @ts-ignore

import { OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { settings } from "../../../constants/settings";
import { Folder } from "@carbon/pictograms-react";

type Props = {};

const ProjectViewer = (props: Props) => {
  const fakeProjectList = [
    {
      id: 1,
      name: "Bancada de testes de sementes",
      responsible: "Lucas Silva",
      lastModification: "12/01/2023",
    },
    {
      id: 2,
      name: "Lumina 500",
      responsible: "Lucas Silva",
      lastModification: "12/01/2023",
    },
  ];

  const renderProjectList = () => {
    return (
      <>
        <ul className={classnames(`${settings.sipePrefix}--project-list-ul`)}>
          {fakeProjectList.map((project) => {
            return renderProjectListItem(project);
          })}
        </ul>
      </>
    );
  };

  const renderProjectListItem = (project) => {
    return (
      <>
        <li
          key={project.id}
          className={classnames(`${settings.sipePrefix}--project-list-item`)}
        >
          <div
            className={classnames(
              `${settings.sipePrefix}--project-list-item-content`
            )}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "row",
                width: "100%",
              }}
            >
              <div style={{ display: "flex" }}>
                <Folder className="folder-pictogram" size={24} />
                <div
                  className={classnames(
                    `${settings.sipePrefix}--project-list-item-details`
                  )}
                >
                  <div style={{ display: "flex" }}>
                    <h4>{project.name}</h4>
                  </div>
                  <div style={{ display: "flex" }}>
                    <p>Responsável: </p> <span>{project.responsible}</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <p>Ultima modificação: </p>{" "}
                    <span>{project.lastModification}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <OverflowMenu ariaLabel="overflow-menu" align="bottom">
                  <OverflowMenuItem itemText="Stop app" />
                  <OverflowMenuItem itemText="Restart app" />
                  <OverflowMenuItem itemText="Rename app" />
                  <OverflowMenuItem
                    itemText="Clone and move app"
                    disabled
                    requireTitle
                  />
                  <OverflowMenuItem
                    itemText="Edit routes and access"
                    requireTitle
                  />
                  <OverflowMenuItem hasDivider isDelete itemText="Delete app" />
                </OverflowMenu>
              </div>
            </div>
          </div>
        </li>
      </>
    );
  };

  return (
    <div className={classnames(`${settings.sipePrefix}--project-list`)}>
      <WidgetWrapper showIcons={false} title={"Lista de projetos"}>
        {renderProjectList()}
      </WidgetWrapper>
    </div>
  );
};

export default ProjectViewer;
