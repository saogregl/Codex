/* eslint-disable @typescript-eslint/ban-ts-comment */
import { motion } from "framer-motion";

import React from "react";
import classnames from "classnames";
import { settings } from "../../constants/settings";
// @ts-ignore
import { Button, Layer, Theme } from "@carbon/react";
import { Close } from "@carbon/icons-react";
import { useFilterStore } from "../../Stores/filterStore";

interface FilterPanelProps {
	children: React.ReactNode[] | React.ReactNode;
	className?: string;
	filterSections?: unknown[];
	open?: boolean;
	primaryActionLabel?: string;
	filterPanelMinHeight?: number;
}

const SearchPanel = ({ children, className }: FilterPanelProps) => {
	const { reset } = useFilterStore();

	const childArray = React.Children.toArray(children);
	return (
		<div
			className={classnames(
				`${settings.sipePrefix}--search-panel-wrapper`,
				`${className ? className : ""}`,
			)}
		>
			<div className={`${settings.sipePrefix}--search-panel-content`}>
				<div className={`${settings.sipePrefix}--search-panel-header`}>
					<p className={`${settings.sipePrefix}--search-panel-header-text`}>
						Filtros
					</p>
					<Button
						onClick={reset}
						iconDescription="Resetar filtros"
						tooltipAlignment="end"
						tooltipPosition="bottom"
						hasIconOnly
						size="sm"
						kind="ghost"
						renderIcon={() => <Close />}
					/>
				</div>
				{childArray.map((child) => {
					return (
						<div style={{ width: "100%" }} key={child.toString()}>
							{child}
						</div>
					);
				})}
			</div>
			<div className={`${settings.sipePrefix}--search-panel-separator`} />
		</div>
	);
};

export default SearchPanel;
