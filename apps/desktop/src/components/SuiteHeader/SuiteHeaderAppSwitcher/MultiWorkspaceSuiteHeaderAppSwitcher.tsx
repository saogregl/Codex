/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-script-url */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import classnames from 'classnames';
import { ChevronRight, ChevronLeft, Launch, Bee, Grid } from "@carbon/react/icons";
// @ts-ignore

import { SideNavLink, SideNavDivider } from '@carbon/react';

import { settings } from '../../../constants/settings';
import { handleSpecificKeyDown } from '../../../utils/componentsUtils';
import { useClickOutside } from '../../../hooks/useClickOutside';
import rspc from '../../../lib/query';
import { workspaces as getWorkspacesData } from '../constants/workspaces';

const defaultValues = {
  customApplications: [],
  globalApplications: [],
  onRouteChange: async () => true,
  i18n: {
    workspace: 'Area de trabalho',
    workspaces: 'Áreas de trabalho',
    workspaceAdmin: 'Administração de área de trabalho',
    backToAppSwitcher: 'Voltar para o seletor',
    selectWorkspace: 'Selecione uma área de trabalho',
    availableWorkspaces: 'Áreas de trabalho disponíveis',
    suiteAdmin: 'Administração',
    global: 'Global',
    allApplicationsLink: 'Ver todas as aplicações',
    requestAccess: 'Solicitar acesso',
    learnMoreLink: 'Saiba mais',
  },
  testId: 'multi-workspace-suite-header-app-switcher',
  isExpanded: false,
  workspaces: null,
  noAccessLink: null,
  adminLink: null,
  isAdminView: false,
};

interface Application {
  id: string;
  name: string;
  href: string;
  isExternal?: boolean;
  icon?: string;

}

interface Workspace {
  id: string;
  name: string;
  href: string;
  adminHref?: string;
  isCurrent?: boolean;
}

interface Props {
  customApplications?: Application[];
  globalApplications?: Application[];
  noAccessLink?: string;
  ref?: unknown;
  onRouteChange?(...args: unknown[]): unknown;
  i18n?: {
    workspace?: string;
    workspaces?: string;
    workspaceAdmin?: string;
    backToAppSwitcher?: string;
    selectWorkspace?: string;
    availableWorkspaces?: string;
    suiteAdmin?: string;
    global?: string;
    allApplicationsLink?: string;
    requestAccess?: string;
    learnMoreLink?: string;
  };
  testId?: string;
  isExpanded?: boolean;
  adminLink?: string;
  isAdminView?: boolean;
  workspaces?: Workspace[];
}

const MultiWorkspaceSuiteHeaderAppSwitcher = ({
  customApplications = defaultValues.customApplications,
  globalApplications = defaultValues.globalApplications,
  noAccessLink = defaultValues.noAccessLink,
  i18n = { ...defaultValues.i18n },
  onRouteChange = defaultValues.onRouteChange,
  testId = defaultValues.testId,
  isExpanded = defaultValues.isExpanded,
  workspaces = [],
  adminLink = null,
  ref = null
}: Props) => {
  const [isWorkspacesView, setWorkspacesView] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);


  const mergedI18n = i18n;
  const baseClassName = `${settings.sipePrefix}--suite-header-app-switcher-multiworkspace`;
  const workspaceApplications = workspaces ? selectedWorkspace?.applications ?? [] : null;
  const currentWorkspace = workspaces?.find((wo) => wo.isCurrent);

  useEffect(() => {
    // Show the workspace selection list if no workspace has been selected yet and if this is not a workspace-based page
    if (!isWorkspacesView && !selectedWorkspace && workspaces?.length > 1 && !currentWorkspace) {
      setWorkspacesView(true);
    }
  }, [isWorkspacesView, workspaces, selectedWorkspace, currentWorkspace]);

  // const projectContextStore = useProjectContextStore();




  useEffect(() => {
    if (!selectedWorkspace) {
      // If only 1 workspace is available, select it regardless of whether or not we are in a workspace-based page
      if (workspaces?.length === 1) {
        setSelectedWorkspace(workspaces[0]);
        setWorkspacesView(false);
      } else if (currentWorkspace) {
        // If there are more workspace, select the one with the isCurrent flag set
        setSelectedWorkspace(currentWorkspace);
        setWorkspacesView(false);
      }
    }
  }, [workspaces, currentWorkspace, selectedWorkspace, setSelectedWorkspace]);

  const handleRouteChange = useCallback(
    async (event: { preventDefault: () => void; }, url: unknown, isExternal = false, data = null) => {
      event.preventDefault();
      const result = await onRouteChange(url, data);
      if (result) {
        if (isExternal) {
          console.log('isExternal')
        } else {
          console.log(event)
          console.log(url)
        }
      }
    },
    [onRouteChange]
  );


  const handleApplicationRoute = useCallback(
    ({ id, href, isExternal }) => async (e: any) =>
      handleRouteChange(e, href, isExternal, { appId: id }),
    [handleRouteChange]
  );

  const handleWorkspaceRoute = useCallback(
    ({ id, href }) => async (e: any) =>
      handleRouteChange(e, href, false, { workspaceId: id }),
    [handleRouteChange]
  );



  const handleWorkspaceSelection = useCallback(
    (workspace: { id: any }) => async (e: any) => {
      const { id } = workspace;
      if (!currentWorkspace) {
        setSelectedWorkspace(workspace);
        setWorkspacesView(false);
      }
    },
    [currentWorkspace]
  );


  const tabIndex = isExpanded ? 0 : -1;

  const renderNavItem = useCallback(
    (name: any, href: any, isExternal: any, icon: any, eventHandler: any, isSelected: any, keySuffix: any) => (
      <SideNavLink
        id={`${testId}--${keySuffix}`}
        key={`${testId}--${keySuffix}`}
        className={classnames(`${baseClassName}--app-link`, {
          [`${baseClassName}--external`]: isExternal,
          [`${baseClassName}--no-icon`]: !icon,
        })}
        data-testid={`${testId}--${keySuffix}`}
        onClick={eventHandler}
        onKeyDown={handleSpecificKeyDown(['Enter', 'Space'], eventHandler)}
        tabIndex={tabIndex}
        renderIcon={
          icon
            ? typeof icon === 'string'
              ? () => <img src={`data:image/svg+xml;base64, ${icon}`} alt="appIcon" />
              : icon
            : null
        }
        href={href}
        rel="noopener noreferrer"
        large
        isActive={isSelected}
        title={name}
      >
        {name}
        {isExternal ? <Launch /> : null}
      </SideNavLink>
    ),

    [baseClassName, tabIndex, testId]
  );

  const selectedWorkspaceLabel =
    selectedWorkspace?.name ?? selectedWorkspace?.id ?? mergedI18n.selectWorkspace;

  return (
    <ul data-testid={testId} className={baseClassName} >
      {!isWorkspacesView ? (
        <>
          {getWorkspacesData?.length > 1 ? (
            <>
              <p>{mergedI18n.workspace}</p>

              <SideNavLink
                id={`${testId}--selected-workspace`}
                key={`${testId}--selected-workspace`}
                className={`${baseClassName}--app-link ${baseClassName}--workpsace-selector`}
                data-testid={`${testId}--selected-workspace`}
                onClick={() => setWorkspacesView(true)}
                onKeyDown={handleSpecificKeyDown(['Enter', 'Space'], () => setWorkspacesView(true))}
                tabIndex={tabIndex}
                renderIcon={ChevronRight}
                large
                title={selectedWorkspaceLabel}
              >
                {selectedWorkspaceLabel}
              </SideNavLink>

              <SideNavDivider className={`${baseClassName}--divider`} />
            </>
          ) : null}
          {selectedWorkspace?.href
            ? renderNavItem(
              mergedI18n.allApplicationsLink,
              selectedWorkspace.href,
              false,
              Grid,
              handleWorkspaceRoute({ id: selectedWorkspace.id, href: selectedWorkspace.href }),
              false,
              `all-applications`
            )
            : null}
          {/*           {selectedWorkspace && workspaceApplications?.length === 0 ? (
            <div data-testid={`${testId}--no-app`} className={`${baseClassName}--no-app`}>
              <div className="bee-icon-container">
                <Bee />
                <div className="bee-shadow" />
              </div>
              <span>{mergedI18n.requestAccess}</span>
              <a
                href={noAccessLink}
                rel="noopener noreferrer"
                data-testid={`${testId}--no-access`}
                onClick={async (e) => {
                  e.preventDefault();
                  const result = await onRouteChange(
                    noAccessLink
                  );
                  if (result) {
                    window.location.href = noAccessLink;
                  }
                }}
                tabIndex={tabIndex}
              >
                {mergedI18n.learnMoreLink}
              </a>
            </div>
          ) : null}
 */}        </>
      ) : (
        <>
          {selectedWorkspace ? (
            <>
              <SideNavLink
                id={`${testId}--back-to-switcher`}
                key={`${testId}--back-to-switcher`}
                className={`${baseClassName}--app-link`}
                data-testid={`${testId}--back-to-switcher`}
                onClick={() => setWorkspacesView(false)}
                onKeyDown={handleSpecificKeyDown(['Enter', 'Space'], () =>
                  setWorkspacesView(false)
                )}
                renderIcon={ChevronLeft}
                tabIndex={tabIndex}
                large
                title={mergedI18n.backToAppSwitcher}
              >
                {mergedI18n.backToAppSwitcher}
              </SideNavLink>

              <SideNavDivider className={`${baseClassName}--divider`} />

              <p>{mergedI18n.availableWorkspaces}</p>
            </>
          ) : (
            <p>{mergedI18n.selectWorkspace}</p>
          )}
          {getWorkspacesData.map((workspace) =>
            renderNavItem(
              workspace.name ?? workspace.id,
              null,
              false,
              null,
              handleWorkspaceSelection(workspace),
              workspace.id === selectedWorkspace?.id,
              `workspace-${workspace.id}`
            )
          )}
        </>
      )}
      {adminLink || globalApplications?.length > 0 ? (
        <>
          <SideNavDivider className={`${baseClassName}--divider`} />
          <p>{mergedI18n.global}</p>
        </>
      ) : null}
      {globalApplications?.map(({ id, name, href, isExternal = false, icon = null }) =>
        renderNavItem(
          name,
          href,
          isExternal,
          icon,
          handleApplicationRoute({ id, href, isExternal }),
          false,
          `global-application-${id}`
        )
      )}
      {customApplications.length > 0 ? (
        <SideNavDivider className={`${baseClassName}--divider`} />
      ) : null}
      {customApplications.map(({ id, name, href, isExternal = false, icon = null }) =>
        renderNavItem(
          name,
          href,
          isExternal,
          icon,
          handleApplicationRoute({ id, href, isExternal }),
          false,
          `custom-application-${id}`
        )
      )}
    </ul>
  );
};

export default MultiWorkspaceSuiteHeaderAppSwitcher;
