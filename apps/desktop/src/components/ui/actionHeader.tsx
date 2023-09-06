/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
	Button, // @ts-ignore
	InlineLoading,
} from "@carbon/react";

interface Actions {
	id: string | number;
	title: string;
	icon?: React.ElementType;
	onClick: () => void;
	disabled: boolean;
	isLoading: boolean;
	hasError: boolean;
}

interface ActionHeaderProps {
	actions: Actions[];
}

import { settings } from "../../constants/settings";
import classnames from "classnames";

const ActionHeader = (props: ActionHeaderProps) => {
	const { actions } = props;
	return (
		<div className={classnames(`${settings.sipePrefix}--header-actions`)}>
			<div>
				<span
					className={classnames(
						`${settings.sipePrefix}--header-actions-header`,
					)}
				>
					Crie uma nova coleção
				</span>
			</div>
			{actions.map((action) =>
				!action.isLoading ? (
					<Button
						key={action.id}
						onClick={action.onClick}
						renderIcon={action.icon ? action.icon : undefined}
						size="md"
						disabled={action.disabled}
					>
						<span>{action.title}</span>
					</Button>
				) : (
					<InlineLoading
						key={action.id}
						style={{ width: "234.5px" }}
						description={action.title}
						status={action.hasError ? "error" : "active"}
						aria-live={action.title}
					/>
				),
			)}
		</div>
	);
};

export default ActionHeader;
