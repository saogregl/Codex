import { useState, useEffect, useRef, useCallback } from "react";
import classnames from "classnames";
import { settings } from "../../constants/settings";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { appWindow } from "@tauri-apps/api/window";

import {
  Notification,
  Switcher as SwitcherIcon,
  Home,
} from "@carbon/icons-react";
import {
  ChromeCloseIcon,
  ChromeMinimizeIcon,
  ChromeRestoreIcon,
} from "@fluentui/react-icons-mdl2";
import {
  // @ts-ignore

  Header,
  // @ts-ignore

  HeaderMenuButton,
  // @ts-ignore

  HeaderName,
  // @ts-ignore

  HeaderGlobalBar,
  // @ts-ignore

  HeaderGlobalAction,
  // @ts-ignore

  SkipToContent,
  // @ts-ignore

  SideNav,
  // @ts-ignore

  SideNavDivider,
  // @ts-ignore

  SideNavItems,
  // @ts-ignore

  SideNavLink,
  // @ts-ignore

  HeaderPanel,
  Search,
  Dropdown,
} from "@carbon/react";


import { Theme } from "@carbon/react";


type Props = {
};

const TitleBar = (props: Props) => {


  const minimize = useCallback(() => {
    appWindow.minimize();
  }, []);

  const maximize = useCallback(() => {
    appWindow.toggleMaximize();
  }, []);

  const maximizeByDoubleClick = useCallback((e) => {
    e.preventDefault();
    if (e.target.closest(noDragSelector)) return;
    maximize();
  }, []);

  const close = useCallback(() => {
    appWindow.close();
  }, []);

  const startDragging = useCallback((e) => {
    if (e.detail > 1) return;
    if (e.target.closest(noDragSelector)) return;
    appWindow.startDragging();
  }, []);

  const noDragSelector =
    "input, a, button, input *, a *, button *, #notification-button, .notification-button"; // CSS selector

  useEffect(() => {
    // Create Dragging Functionality

    const header = document.getElementsByClassName("cds--header__global")[0];

    header.addEventListener("mousedown", startDragging);
    header.addEventListener("dblclick", maximizeByDoubleClick);


    document
      .getElementById("titlebar-minimize")
      .addEventListener("click", minimize);
    document
      .getElementById("titlebar-maximize")
      .addEventListener("click", maximize);
    document.getElementById("titlebar-close").addEventListener("click", close);

    return () => {
      // This function gets called when the "effect wears off"
      // which means we need to unregister the listener
      document
        .getElementById("titlebar-minimize")
        .removeEventListener("click", minimize);
      document
        .getElementById("titlebar-maximize")
        .removeEventListener("click", maximize);
      document
        .getElementById("titlebar-close")
        .removeEventListener("click", close);
      header.removeEventListener("mousedown", startDragging);
      header.removeEventListener("dblclick", maximizeByDoubleClick);
    };
  }, [maximizeByDoubleClick, startDragging]);



  return (
    <div data-tauri-drag-region className="titlebar">
      <Header aria-label="Jacto Platform">
        <SkipToContent />
        <HeaderName href="#" prefix="Jacto">
          [SI]
          <span
            className={classnames(`${settings.sipePrefix}--header-subtitle`)}
          >
            <div
              style={{
                display: "flex",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              Sistema de integração
            </div>
          </span>
        </HeaderName>
        <HeaderGlobalBar>



          <HeaderGlobalAction aria-label="Minimizar" tooltipAlignment="end">
            <div className="titlebar-button" id="titlebar-minimize">
              <ChromeMinimizeIcon
                style={{
                  width: 12,
                  height: 12,
                }}
              />
            </div>
          </HeaderGlobalAction>

          <HeaderGlobalAction aria-label="Restaurar" tooltipAlignment="end">
            <div className="titlebar-button" id="titlebar-maximize">
              <ChromeRestoreIcon
                style={{
                  width: 12,
                  height: 12,
                }}
              />
            </div>
          </HeaderGlobalAction>

          <HeaderGlobalAction aria-label="Sair" tooltipAlignment="end">
            <div className="titlebar-button" id="titlebar-close">
              <ChromeCloseIcon
                style={{
                  width: 12,
                  height: 12,
                }}
              />
            </div>
          </HeaderGlobalAction>

        </HeaderGlobalBar>
      </Header>
    </div>
  );
};

export default TitleBar;
