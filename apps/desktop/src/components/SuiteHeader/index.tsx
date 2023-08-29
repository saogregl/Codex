/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useEffect, useRef, useCallback } from "react";
import classnames from "classnames";
import { settings } from "../../constants/settings";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Apps } from "./constants/apps";
import {
  Notification,
  Switcher as SwitcherIcon,
  Home,
  Db2Database,
  LightFilled,
  Light,
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
  SideNavMenu,
  // @ts-ignore
  SideNavMenuItem,
  // @ts-ignore
  HeaderPanel,
  Search,
  Dropdown,
} from "@carbon/react";
import { Theme } from "@carbon/react";
import { NotificationsPanel } from "@carbon/ibm-products";
import MultiWorkspaceSuiteHeaderAppSwitcher from "./SuiteHeaderAppSwitcher/MultiWorkspaceSuiteHeaderAppSwitcher";
import { Profile } from "../Profile";
import useStore from "../../Stores/sessionStore";
import { workspaces } from "./constants/workspaces";
import useCustomHeader from "./SuiteHeaderAppSwitcher/hooks/useCustomHeader";
import useNotifications from "../../hooks/useNotifications";
import useThemeStore from "../../Stores/themeStore";

const layout = () => {
  //We need to know which menu is currently active
  const [activeMenu, setActiveMenu] = useState("");
  const [isSideNavExpanded, setSideNavExpanded] = useState(false);
  const [isSwitcherExpanded, setSwitcherExpand] = useState(false);
  const [isNotificationsExpanded, setNotificationsExpand] = useState(false);

  const location = useLocation();

  // The route "/" should redirect to login, but since we have no login for this application, we'll redirect to /home
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home");
    }
  }, []);

  const navigate = useNavigate();

  const {
    notifications,
    dismissAllNotifications,
    dismissNotification,
    removeNotification
  } = useNotifications();

  const userStore = useStore();
  const appSwitcherRef = useRef(null);

  useEffect(() => {
    //Check which menu is active comparing the location with the routes
    const activeMenu = Apps.find((route) => {
      return route.href === location.pathname;
    });

    setActiveMenu(activeMenu?.ItemName);

    console.log(location.pathname)
  }, [location]);

  const { minimizeRef, maximizeRef, CloseRef } = useCustomHeader();


  // useEffect(() => {
  //   const getSession = async () => {
  //     // @ts-ignore-next-line
  //     if (!userStore.currentSession) {
  //       await supabase.auth.getSession().then(({ data, error }) => {
  //         // @ts-ignore-next-line

  //         userStore.setCurrentSession(data);
  //         if (error) {
  //           navigate("/");
  //         }
  //         if (data.session === null) {
  //           navigate("/");
  //         }
  //       });
  //     }
  //   };
  //   getSession();
  // }, []);


  const expandSidenav = useCallback(() => {
    setSideNavExpanded(!isSideNavExpanded);
  }, [isSideNavExpanded]);

  const expandSwitcher = useCallback(() => {
    setSwitcherExpand(!isSwitcherExpanded);
  }, [isSwitcherExpanded]);

  const expandNotifications = useCallback(() => {
    setNotificationsExpand(!isNotificationsExpanded);
  }, [isNotificationsExpanded]);



  const { theme, switchTheme } = useThemeStore();

  return (
    <Theme theme="g100">
      <Header aria-label="Jacto Platform">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Abrir Menu"
          isCollapsible
          onClick={expandSidenav}
          isActive={isSideNavExpanded}
        />
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
              Codex
            </div>
          </span>
        </HeaderName>
        <HeaderGlobalBar>
          {/* <div
            style={{
              display: "flex",
              justifyContent: "center", // Horizontally center the items
              width: "100%", // Adjust the width as needed
            }}
          >
            <div className={classnames(`${settings.sipePrefix}--header-searchBar`)}
            >

              <Dropdown
                id="dropdown-1"
                items={["Option 1", "Option 2", "Option 3"]}
                label="Projetos"
                size="lg"
              />

              <Search labelText={""} size={"lg"} />
            </div>

          </div> */}
          <HeaderGlobalAction
            aria-label="Tema"
            onClick={switchTheme}
            id="theme-switcher"
            className="theme-switcher"
          >
            {theme == "g10" ? <LightFilled /> : <Light />}
          </HeaderGlobalAction>

          <HeaderGlobalAction
            aria-label="Notificações"
            onClick={expandNotifications}
            id="notification-button"
            className="notification-button"
          >
            <Notification size={20} />
          </HeaderGlobalAction>

          <Profile />

          <NotificationsPanel
            open={isNotificationsExpanded}
            onClickOutside={() => setNotificationsExpand(false)}
            data={notifications}
            onSettingsClick={() => console.log("Settings clicked")}
            onDismissAllNotifications={() => dismissAllNotifications()}
            onDismissSingleNotification={(notification) => {
              console.log("Notification dismissed", notification)
              removeNotification(notification.id)
            }}
            dismissAllLabel="Descartar todas"
            viewAllLabel="Ver todas"
            previousLabel="Anterior"
            readLessLabel="Ler menos"
            readMoreLabel="Ler mais"
            title="Notificações"
            todayLabel="Hoje"
            yesterdayLabel="Ontem"
            settingsIconDescription="Configurações"
            nowText="Agora"
            emptyStateLabel="Você não possui novas notificações"
            doNotDisturbLabel="Não perturbe"
            dismissSingleNotificationIconDescription="Marcar como lida"
            daysAgoText={(daysAgo) => `${daysAgo} dias atrás`}
            hoursAgoText={(hoursAgo) => `${hoursAgo} horas atrás`}
            minutesAgoText={(minutesAgo) => `${minutesAgo} minutos atrás`}
            minuteAgoText={(minutesAgo) => `${minutesAgo} minuto atrás`}
            monthsAgoText={(monthsAgo) => `${monthsAgo} meses atrás`}
            monthAgoText={(monthAgo) => `${monthAgo} mês atrás`}
            yearAgoText={(yearAgo) => `${yearAgo} ano atrás`}
            yearsAgoText={(yearsAgo) => `${yearsAgo} anos atrás`}
            yesterdayAtText={(yesterdayAt) => `Ontem às ${yesterdayAt}`}

          />

          <HeaderGlobalAction
            aria-label="Seletor de aplicativos"
            tooltipAlignment="end"
            onClick={() => {
              expandSwitcher()
            }}
          >
            <SwitcherIcon size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Minimizar" tooltipAlignment="end">
            <div className="titlebar-button" id="titlebar-minimize" ref={minimizeRef}>
              <ChromeMinimizeIcon
                style={{
                  width: 12,
                  height: 12,
                }}
              />
            </div>
          </HeaderGlobalAction>

          <HeaderGlobalAction aria-label="Restaurar" tooltipAlignment="end">
            <div className="titlebar-button" id="titlebar-maximize" ref={maximizeRef}>
              <ChromeRestoreIcon
                style={{
                  width: 12,
                  height: 12,
                }}
              />
            </div>
          </HeaderGlobalAction>

          <HeaderGlobalAction aria-label="Sair" tooltipAlignment="end">
            <div className="titlebar-button" id="titlebar-close" ref={CloseRef}>
              <ChromeCloseIcon
                style={{
                  width: 12,
                  height: 12,
                }}
              />
            </div>
          </HeaderGlobalAction>
          <HeaderPanel
            aria-label="Painel superior"
            expanded={isSwitcherExpanded}
            ref={appSwitcherRef}
          >
            <MultiWorkspaceSuiteHeaderAppSwitcher
              workspaces={workspaces} />
          </HeaderPanel>

        </HeaderGlobalBar>
        <SideNav
          aria-label="Side navigation"
          isRail
          expanded={isSideNavExpanded}
          onOverlayClick={expandSidenav}
        // isPersistent={false}
        >
          <SideNavItems>
            <SideNavLink
              isActive={activeMenu ? false : location.pathname == "/home"}
              renderIcon={Home}
              href="/home"
              large
            >
              Home
            </SideNavLink>
            <SideNavDivider />
            <SideNavLink
              isActive={activeMenu ? false : location.pathname == "/data"}
              renderIcon={Db2Database}
              href="/data"
              large
            >
              Dados
            </SideNavLink>


            {Apps.map((route) => {
              return (
                // Make menu active when clicked on
                <SideNavMenu
                  renderIcon={route.icon}
                  key={route.ItemName}
                  href={route.href}
                  isActive={activeMenu ? false : location.pathname == route.href}
                  title={route.ItemName}
                  large
                >
                  {route.children?.map((child) => {
                    return (
                      <SideNavMenuItem href={child.href} key={child.href}>
                        {/* {child.icon && child.icon()} */}
                        {child.ItemName}
                      </SideNavMenuItem>
                    );
                  })}
                </SideNavMenu >
              );
            })}
          </SideNavItems>
        </SideNav>
      </Header>

      <main>
        <Theme theme={theme}>
          <div
            className={
              !isSideNavExpanded
                ? classnames(`${settings.sipePrefix}--content`)
                : classnames(
                  `${settings.sipePrefix}--content`,
                  `${settings.sipePrefix}--side-nav--expanded`
                )
            }
          >
            <Outlet />
          </div>
        </Theme>
      </main>
    </Theme>
  );
};
export default layout;
