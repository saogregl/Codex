/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useEffect, useRef, useCallback } from "react";
import classnames from "classnames";
import { settings } from "../../constants/settings";
import { Outlet, useLocation } from "react-router-dom";
import { Apps } from "./constants/apps";
import {
	Notification,
	NotificationNew,
	Switcher as SwitcherIcon,
	Home,
	IbmWatsonDiscovery,
	LightFilled,
	Light,
} from "@carbon/icons-react";
import {
	ChromeCloseIcon,
	ChromeMinimizeIcon,
	ChromeRestoreIcon,
} from "@fluentui/react-icons-mdl2";
import { Toaster, resolveValue } from "react-hot-toast";

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
	SkeletonText,
	ToastNotification,
} from "@carbon/react";
import { Theme } from "@carbon/react";
import { NotificationsPanel } from "@carbon/ibm-products";
import MultiWorkspaceSuiteHeaderAppSwitcher from "./SuiteHeaderAppSwitcher/MultiWorkspaceSuiteHeaderAppSwitcher";
import { Profile } from "../Profile";
import { workspaces } from "./constants/workspaces";
import useCustomHeader from "./SuiteHeaderAppSwitcher/hooks/useCustomHeader";
import useNotifications from "../../hooks/useNotifications";
import useThemeStore from "../../Stores/themeStore";
import useCollections from "../../hooks/useCollections";
import { defaultNotificationProps } from "./constants/defaultNotificationProps";

const layout = () => {
	//We need to know which menu is currently active
	const [activeMenu, setActiveMenu] = useState("");
	const [isSideNavExpanded, setSideNavExpanded] = useState(false);
	const [isSwitcherExpanded, setSwitcherExpand] = useState(false);
	const [isNotificationsExpanded, setNotificationsExpand] = useState(false);

	const location = useLocation();
	const { collections, isLoadingcollections } = useCollections();

	const {
		notifications,
		dismissAllNotifications,
		removeNotification,
		hasUnreadNotifications,
	} = useNotifications();

	const appSwitcherRef = useRef(null);

	useEffect(() => {
		//Check which menu is active comparing the location with the routes
		const activeMenu = Apps.find((route) => {
			return route.href === location.pathname;
		});

		setActiveMenu(activeMenu?.ItemName);

		console.log(location.pathname);
	}, [location]);

	const { minimizeRef, maximizeRef, CloseRef } = useCustomHeader();

	const expandSidenav = useCallback(() => {
		setSideNavExpanded(!isSideNavExpanded);
	}, [isSideNavExpanded]);

	// const expandSwitcher = useCallback(() => {
	// 	setSwitcherExpand(!isSwitcherExpanded);
	// }, [isSwitcherExpanded]);

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
					<HeaderGlobalAction
						aria-label="Tema"
						onClick={switchTheme}
						id="theme-switcher"
						className="theme-switcher"
					>
						{theme === "g10" ? <LightFilled /> : <Light />}
					</HeaderGlobalAction>
					<HeaderGlobalAction
						aria-label="Notificações"
						onClick={expandNotifications}
						id="notification-button"
						className="notification-button"
					>
						{!hasUnreadNotifications() ? (
							<Notification size={20} />
						) : (
							<NotificationNew size={20} />
						)}
					</HeaderGlobalAction>

					<Profile />

					<NotificationsPanel
						open={isNotificationsExpanded}
						onClickOutside={() => setNotificationsExpand(false)}
						data={notifications}
						onSettingsClick={() => console.log("Settings clicked")}
						onDismissAllNotifications={() => dismissAllNotifications()}
						onDismissSingleNotification={(notification) => {
							removeNotification(notification.id);
						}}
						{...defaultNotificationProps}
					/>

					<HeaderGlobalAction aria-label="Minimizar" tooltipAlignment="end">
						<div
							className="titlebar-button"
							id="titlebar-minimize"
							ref={minimizeRef}
						>
							<ChromeMinimizeIcon
								style={{
									width: 12,
									height: 12,
								}}
							/>
						</div>
					</HeaderGlobalAction>

					<HeaderGlobalAction aria-label="Restaurar" tooltipAlignment="end">
						<div
							className="titlebar-button"
							id="titlebar-maximize"
							ref={maximizeRef}
						>
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
						<MultiWorkspaceSuiteHeaderAppSwitcher workspaces={workspaces} />
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
							isActive={activeMenu ? false : location.pathname === "/"}
							renderIcon={Home}
							href="/"
							large
						>
							Home
						</SideNavLink>
						<SideNavDivider />
						<SideNavLink
							isActive={activeMenu ? false : location.pathname === "/data"}
							renderIcon={IbmWatsonDiscovery}
							href="/data"
							large
						>
							Busca
						</SideNavLink>

						{Apps.map((route) => {
							if (route.ItemName === "Coleções") {
								return (
									<SideNavMenu
										renderIcon={route.icon}
										key={route.ItemName}
										href={route.href}
										isActive={
											activeMenu ? false : location.pathname === route.href
										}
										title={route.ItemName}
										large
									>
										{route.children?.map((child) => {
											return (
												<SideNavMenuItem href={child.href} key={child.href}>
													{child.render ? child.render() : child.ItemName}
												</SideNavMenuItem>
											);
										})}

										{isLoadingcollections ? (
											<SideNavMenuItem
												href={"/collections/all"}
												key={"/collections/all"}
											>
												{/* {child.icon && child.icon()} */}
												{/* // if we have a render prop for the child, we render it, otherwise we render the ItemName */}
												<SkeletonText lineCount={2} width="100%" />
											</SideNavMenuItem>
										) : (
											collections.map((child) => {
												return (
													<SideNavMenuItem href={child.id} key={child.uuid}>
														{/* {child.icon && child.icon()} */}
														{/* // if we have a render prop for the child, we render it, otherwise we render the ItemName */}
														{child.name}
													</SideNavMenuItem>
												);
											})
										)}
									</SideNavMenu>
								);
							}
							return (
								// Make menu active when clicked on
								<SideNavMenu
									renderIcon={route.icon}
									key={route.ItemName}
									href={route.href}
									isActive={
										activeMenu ? false : location.pathname === route.href
									}
									title={route.ItemName}
									large
								>
									{route.children?.map((child) => {
										return (
											<SideNavMenuItem href={child.href} key={child.href}>
												{/* {child.icon && child.icon()} */}
												{/* // if we have a render prop for the child, we render it, otherwise we render the ItemName */}
												{child.render ? child.render() : child.ItemName}
											</SideNavMenuItem>
										);
									})}
								</SideNavMenu>
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
										`${settings.sipePrefix}--side-nav--expanded`,
								)
						}
					>
						<Toaster position="top-right">
							{(t) => (
								<ToastNotification
									aria-label="closes notification"
									caption={new Date(Date.now()).toLocaleTimeString()}
									kind="info"
									role="alert"
									statusIconDescription="notification"
									subtitle="Notificação"
									title={t.message as string}
								/>
							)}
						</Toaster>
						{/* <div style={{ display: "flex", position: "absolute", right: "240px", top: "48px", zIndex: "9999999" }}>
							{showNotificationToast &&
								<ToastNotification
									aria-label="closes notification"
									caption="00:00:00 AM"
									kind="info"
									onClose={function noRefCheck() { }}
									onCloseButtonClick={function noRefCheck() { }}
									role="alert"
									statusIconDescription="notification"
									subtitle="Subtitle text goes here"
									title="Notification title"
								/>
							}
						</div> */}

						<Outlet />
					</div>
				</Theme>
			</main>
		</Theme>
	);
};
export default layout;
