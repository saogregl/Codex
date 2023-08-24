import { FlexGrid, Row, Column } from "@carbon/react";
import { Button } from "@carbon/react";
import { SidePanel, ProductiveCard } from "@carbon/ibm-products"
import { settings } from "../../constants/settings";
import { Edit, TrashCan } from "@carbon/icons-react"
import DataGridComponent from "../../components/Datagrid/DataGridComponent";
import { AreaChartExample } from "../../components/ChartTest";
import { ICA } from "../../components/ICA";
type Props = {
    open: boolean
    setOpen: (boolean) => void
}

const Summary = ({ open, setOpen }: Props) => {
    const defaultProps = {
        title: "GOP",
        description: "Lumina 500",
        actionIcons: [
            {
                id: "1",
                icon: (props) => <Edit size={16} {...props} />,
                // Remove the empty onClick method
                iconDescription: "Edit"
            },
            {
                id: "2",
                icon: (props) => <TrashCan size={16} {...props} />,
                iconDescription: "Delete"
            }
        ]
    };



    const renderProjectItems = () => {
        return (
            <ProductiveCard
                {...defaultProps}    >
                <div className={`${settings.sipePrefix}_card_content_wrapper`}>
                    <DataGridComponent />
                    <p>
                        Productive content text
                    </p>
                </div>
            </ProductiveCard >
        )
    }

    const renderCard = () => {
        return (<ProductiveCard
            {...defaultProps}    >
            <div className={`${settings.sipePrefix}_card_content_wrapper`}>
                <AreaChartExample />
                <p>
                    Productive content text
                </p>
            </div>
        </ProductiveCard>
        )
    }

    const renderICA = () => {
        return (<ProductiveCard
            {...defaultProps}    >
            <div className={`${settings.sipePrefix}_card_content_wrapper`}>
                <ICA label='Índice de soluções de Engenharia' value={55} percentage={true} truncate={false} />
                <Button onClick={() => setOpen(!open)}>Open Tearsheet</Button>
                <p>
                    Productive content text
                </p>
            </div>
        </ProductiveCard>
        )
    }



    return (
        <div>

            <SidePanel
                includeOverlay
                className='test'
                open={open}
                onRequestClose={() => setOpen(false)}
                title='Incident management'
                subtitle='Testing subtitle text.'
                actions={[
                    {
                        label: "Submit",
                        onClick: () => setOpen(false),
                        kind: "primary"
                    },
                    {
                        label: "Cancel",
                        onClick: () => setOpen(false),
                        kind: "secondary"
                    }
                ]}
            >
            </SidePanel>

            <FlexGrid condensed fullWidth>

                <Row condensed>
                    <Column lg={4}>{renderCard()}</Column>
                    <Column lg={4}>{renderCard()}</Column>
                    <Column lg={4}>{renderICA()}</Column>
                    <Column lg={4}>{renderICA()}</Column>
                </Row>
                <Row>
                    <Column lg={4}>{renderCard()}</Column>
                    <Column lg={12}>{renderProjectItems()}</Column>
                </Row>

            </FlexGrid>
        </div>
    )
}

export default Summary; 