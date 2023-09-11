/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
	Button,
	Theme,
	TextInput,
	// @ts-ignore
	Modal,
	// @ts-ignore
	ContentSwitcher,
	// @ts-ignore
	Switch,
	// @ts-ignore
	Tag,
	ComposedModal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Select,
	SelectItem,
} from "@carbon/react";
import rspc from "../../lib/query";
import useCollections from "../../hooks/useCollections";
import { useState } from "react";
import { openDirectoryDialog } from "../../utils/file";
import { Edit, TrashCan, Db2Database, DocumentAdd } from "@carbon/icons-react";
import classnames from "classnames";
import { settings } from "../../constants/settings";

interface ICreateCollectionProps {
	allowCreateNewCollection?: boolean;
	collectionId: number;
	open: boolean;
	onRequestClose: () => void;
}

const CreateCollection = ({
	allowCreateNewCollection,
	collectionId,
	open,
	onRequestClose,
}: ICreateCollectionProps) => {
	const { collections, errorCollections, isLoadingcollections } =
		useCollections();
	const [selectedDirectory, setSelectedDirectory] = useState(null);

	const onOpenDirectoryDialog = async () => {
		const selected = await openDirectoryDialog();
		setSelectedDirectory(selected);
	};

	return (
		<Modal
			open={open}
			modalHeading="Adicionar pasta ou arquivo"
			modalLabel={
				allowCreateNewCollection
					? "Adicione novos documentos à uma coleção existente ou crie uma nova coleção."
					: "Adicione novos documentos à uma coleção existente."
			}
			size="sm"
			id="body"
			onRequestClose={() => onRequestClose()}
			primaryButtonText="Adicionar"
			secondaryButtonText="Cancelar"
		>
			<div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
				<TextInput
					id="1"
					labelText="Digite o nome do arquivo ou pasta"
					placeholder="Nome do arquivo ou pasta"
					invalidText="Nome da coleção inválido"
				/>
				{allowCreateNewCollection && (
					<Select
						id={"create-collection-select"}
						labelText="Selecione uma coleção ou crie uma nova"
						helperText='Selecione "Criar nova coleção" para adicionar arquivo ou pasta em nova coleção.'
					>
						{collections
							? collections.map((collection) => {
									return (
										<SelectItem
											key={collection.uuid}
											text={collection.name}
											value={collection.id}
										/>
									);
							  })
							: null}
						<SelectItem
							key={"create-collection"}
							text={"Criar nova coleção"}
							value={"create-collection"}
						/>
					</Select>
				)}

				<Button onClick={onOpenDirectoryDialog}>Selecionar o diretório</Button>
				{selectedDirectory && (
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<DocumentAdd />
						<p
							className={classnames(
								`${settings.sipePrefix}--document-selected`,
							)}
						>
							{selectedDirectory}
						</p>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default CreateCollection;
