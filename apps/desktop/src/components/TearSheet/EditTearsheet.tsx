import React, { forwardRef, useState, useRef, createContext } from "react";
import { Form, SideNav, SideNavItems, SideNavMenuItem } from "@carbon/react";
import { Tearsheet } from "@carbon/ibm-products";
import cx from "classnames";
import { settings } from "../../constants/settings";
import useThemeStore from "../../Stores/themeStore";
import { CreateCollection } from "../CreateCollection";
import useModalStore from "../../Stores/modalStore";

interface ICreateModalProps {
	collectionId: number;
	open: boolean;
	onClose: () => void;
}
interface EditTearsheetProps {
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
	onHandleFormSubmit?(...args: unknown[]): unknown;
	open?: boolean;
	submitButtonText?: string;
	title?: React.ReactNode;
	verticalPosition?: "normal" | "lower";
	createModalProps?: ICreateModalProps;
}

export const FormContext = createContext(null);
export const FormNumberContext = createContext(0);
const blockClass = `${settings.sipePrefix}--tearsheet-edit`;
const EditTearsheet = forwardRef(
	(
		{
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
			onHandleFormSubmit,
			createModalProps,
			...rest
		}: EditTearsheetProps,
		ref,
	) => {
		const { currentState, setCurrentState } = useModalStore();

		const { theme } = useThemeStore();
		const contentRef = useRef();

		const handleCurrentForm = (form) => {
			setCurrentState(form);
		};

		const sideNavItems = [
			{ label: "Descrição" },
			{ label: "Pastas e Arquivos" },
		];

		const themeClassname = theme === "g10" ? "theme-g100" : "theme-g10";
		const influencer = (
			<div>
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
									isActive={currentState === index}
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
				className={cx(blockClass, className, themeClassname)}
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
				{createModalProps && (
					<CreateCollection
						collectionId={createModalProps.collectionId}
						open={createModalProps.open}
						onRequestClose={createModalProps.onClose}
					/>
				)}

				<div className={`${blockClass}__content`} ref={contentRef} role="main">
					<Form onSubmit={onHandleFormSubmit}>
						<FormContext.Provider
							value={{
								currentForm: currentState,
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
