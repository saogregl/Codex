/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PageHeader } from "@carbon/ibm-products";

import {
	Theme,
} from "@carbon/react";
import useThemeStore from "../../../Stores/themeStore";
import { defaultPageHeaderProps } from "../../../constants/defaultPageHeader";

const index = () => {
	const { theme } = useThemeStore();

	return (
		<div>
			<Theme theme={theme}>
				<PageHeader
					{...defaultPageHeaderProps}
					breadcrumbs={[
						{
							href: "/Data",
							key: "Breadcrumb 1",
							label: "Data",
						},
					]}
					title={"Bem vindo, Lucas!"}
					subtitle={"Aqui você pode buscar seus documentos."}
				/>
			</Theme>
			Teste
		</div>
	);
};

export default index;
