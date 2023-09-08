import { Column, Grid, FormGroup, Theme } from "@carbon/react";
import { settings } from "../../constants/settings";
import cx from "classnames";
import React, { forwardRef, useContext } from "react";
import { FormContext, FormNumberContext } from "./EditTearsheet";
import useThemeStore from "../../Stores/themeStore";

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
			// The component props, in alphabetical order (for consistency).

			children,
			className,
			description,
			fieldsetLegendText,
			hasFieldset = true,
			subtitle,
			title,

			// Collect any other property values passed in.
			...rest
		}: EditTearsheetFormProps,
		ref,
	) => {
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
					[`${blockClass}__form--hidden-form`]:
						formNumber !== formContext?.currentForm,
					[`${blockClass}__form--visible-form`]:
						formNumber === formContext?.currentForm,
				})}
				ref={ref}
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
