import { Column, Grid, FormGroup, Theme } from "@carbon/react";
import { settings } from "../../constants/settings";
import cx from "classnames";
import React, { RefObject, forwardRef, useContext } from "react";
import { FormContext, FormNumberContext } from "./EditTearsheet";
import useThemeStore from "../../Stores/themeStore";
import useModalStore from "../../Stores/modalStore";

interface EditTearsheetFormProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	description?: string;
	fieldsetLegendText?: string;
	hasFieldset?: boolean;
	subtitle?: string;
	title?: string;
}

const EditTearsheetForm = forwardRef(
	(
		{
			children,
			className,
			description,
			fieldsetLegendText,
			hasFieldset = true,
			subtitle,
			title,
			...rest
		}: EditTearsheetFormProps,
		ref,
	) => {
		const { currentState } = useModalStore();

		const blockClass = `${settings.sipePrefix}--tearsheet-edit__form`;
		const formContext = useContext(FormContext);
		const formNumber = useContext(FormNumberContext);

		return formContext ? (
			<div
				{
					...// Pass through any other property values as HTML attributes.
					rest
				}
				className={cx(blockClass, className, {
					[`${blockClass}__form--hidden-form`]: formNumber !== currentState,
					[`${blockClass}__form--visible-form`]: formNumber === currentState,
				})}
				ref={ref as RefObject<HTMLDivElement>}
			>
				<Grid>
					<Column xlg={12} lg={12} md={8} sm={4}>
						<h4 className={`${blockClass}--title`}>{title}</h4>
						{subtitle && (
							<h6 className={`${blockClass}--subtitle`}>{subtitle}</h6>
						)}
						{description && (
							<p className={`${blockClass}--description`}>{description}</p>
						)}
					</Column>
					<Column span={100}>
						{hasFieldset ? (
							<FormGroup
								legendText={fieldsetLegendText}
								className={`${blockClass}--fieldset`}
							>
								<Grid>{children}</Grid>
							</FormGroup>
						) : (
							children
						)}
					</Column>
				</Grid>
			</div>
		) : null;
	},
);

export default EditTearsheetForm;
