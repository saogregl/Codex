import { Button } from "@carbon/react";

interface Actions {
    id: string | number;
    title: string;
    icon?: React.ElementType;
    onClick: () => void;
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
                <span className={classnames(`${settings.sipePrefix}--header-actions-header`)}>Crie uma nova coleção</span>
            </div>
            {
                actions.map((action) => (
                    <Button
                        kind="tertiary"
                        key={action.id}
                        onClick={action.onClick}
                        renderIcon={action.icon ? action.icon : undefined}
                        size="md"
                    >
                        <span>{action.title}</span>
                    </Button>
                ))
            }
        </div >
    );
}

export default ActionHeader;