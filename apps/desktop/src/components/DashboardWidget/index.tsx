import classnames from "classnames";
import React from "react";
import { settings } from "../../constants/settings";
import { Minimize, Maximize, ChevronRight } from "@carbon/react/icons";
  // @ts-ignore
import { Button } from "@carbon/react";
type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icons?: JSX.Element[];
  showIcons?: boolean; // default true
};
function DashboardWidget({
  children,
  className,
  title,
  subtitle,
  icons,
  showIcons = true,
}: Props) {
  console.log(icons);
  return (
    <div
      className={classnames(
        `${settings.sipePrefix}--widget-wrapper`,
        `${className ? className : ""}`
      )}
    >
      <div className={classnames(`${settings.sipePrefix}--widget-header`)}>
        <div>
          <div>
            <span
              className={classnames(
                `${settings.sipePrefix}--widget-main-title`
              )}
            >
              {title ? title : "widget"}
            </span>
            <span
              className={classnames(
                `${settings.sipePrefix}--widget-secondary-title`
              )}
            >
              {subtitle ? subtitle : ""}
            </span>
          </div>
        </div>
        {showIcons ? (
          <div style={{ display: "flex", gap: "1px" }}>
            <Button
              hasIconOnly
              iconDescription="Minimizar"
              renderIcon={Minimize}
              kind="tertiary"
            />
            <Button
              hasIconOnly
              iconDescription="Maximizar"
              renderIcon={Maximize}
              kind="tertiary"
            />
            <Button
              hasIconOnly
              iconDescription="Colapsar"
              renderIcon={ChevronRight}
              kind="tertiary"
            />
          </div>
        ) : null}
      </div>

      <div className={classnames(`${settings.sipePrefix}--widget-main`)}>
        {children}
      </div>
    </div>
  );
}
export default DashboardWidget;
