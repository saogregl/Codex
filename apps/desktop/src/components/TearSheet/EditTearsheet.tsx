import React, { forwardRef, useState, useRef, createContext } from "react";
import { Form, SideNav, SideNavItems, SideNavMenuItem } from "@carbon/react";
import { Tearsheet } from "@carbon/ibm-products";
import cx from "classnames";
import { settings } from "../../constants/settings";
import { useClickOutside } from "../../hooks/useClickOutside";

interface MyComponentProps {
	cancelButtonText?: string;
	children?: React.ReactNode;
	className?: string;
	description?: React.ReactNode;
	influencer?: React.ReactElement;
	influencerWidth?: "narrow" | "wide";
	label?: React.ReactNode;
	onClose?(...args: unknown[]): unknown;
    onHandleModalConfirm?(...args: unknown[]): unknown;
    onHandleModalCancel?(...args: unknown[]): unknown;
	open?: boolean;
	submitButtonText?: string;
	title?: React.ReactNode;
	verticalPosition?: "normal" | "lower";
}

// This is a general context for the forms container
// containing information about the state of the container
// and providing some callback methods for forms to use
export const FormContext = createContext(null);

// This is a context supplied separately to each form in the container
// to let it know what number it is in the sequence of forms
export const FormNumberContext = createContext(0);
const blockClass = `${settings.sipePrefix}--tearsheet-edit`;

// Default values for props

/**
 * Use Tearsheet with medium to complex edits. See usage guidance for further information.
 */
const EditTearsheet = forwardRef(
	(
		{
			// The component props, in alphabetical order (for consistency).
			cancelButtonText,
			children,
			className,
			description,
			influencerWidth = "narrow",
			label,
			onClose,
			open,
			submitButtonText,
			title,
			verticalPosition = "normal",
			onHandleModalConfirm,
            onHandleModalCancel,

			// Collect any other property values passed in.
			...rest
		}: MyComponentProps,
		ref,
	) => {
        
		const [currentForm, setCurrentForm] = useState(0);
		const contentRef = useRef();

		const handleCurrentForm = (form) => {
			setCurrentForm(form);
		};

		const sideNavItems = [
			{ label: "Descrição" },
			{ label: "Pastas e Arquivos" },
		];

		const influencer = (
			<div className="tearsheet-stories__dummy-influencer-block">
				<SideNav
					aria-label="Side navigation"
					className={`${blockClass}__side-nav`}
					expanded={true}
					isFixedNav={false}
				>
					<SideNavItems>
						{sideNavItems.map((item, index) => {
							return (
								<SideNavMenuItem
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									onClick={() => handleCurrentForm(index)}
									isActive={currentForm === index}
								>
									{item.label}
								</SideNavMenuItem>
							);
						})}
					</SideNavItems>
				</SideNav>
			</div>
		);

		return (
			<Tearsheet
				{...rest}
				actions={[
					{
						label: "Confirmar",
						onClick: onHandleModalConfirm,
						kind: "primary",
					},
					{
						label: "Cancelar",
						onClick: onHandleModalCancel,
						kind: "secondary",
					},
				]}
				
				className={cx(blockClass, className)}
				description={description}
				hasCloseIcon={true}
				influencer={influencer}
				influencerPosition="left"
				influencerWidth={influencerWidth}
				label={label}
				onClose={onClose}
				open={open} 
				size="wide"
				title={title}
				verticalPosition={verticalPosition}
				ref={ref}
			>
				<div className={`${blockClass}__content`} ref={contentRef} role="main">
					<Form>
						<FormContext.Provider
							value={{
								currentForm,
							}}
						>
							{React.Children.map(children, (child, index) => (
								<FormNumberContext.Provider value={index}>
									{child}
								</FormNumberContext.Provider>
							))}
						</FormContext.Provider>
					</Form>
				</div>
			</Tearsheet>
		);
	},
);

export default EditTearsheet;