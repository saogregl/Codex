/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PageHeader, HTTPError404 } from "@carbon/ibm-products";

import { Theme } from "@carbon/react";
import useThemeStore from "../../Stores/themeStore";
import { defaultPageHeaderProps } from "../../constants/defaultPageHeader";

const index = () => {
	const { theme } = useThemeStore();

	return (
		<div>
			<Theme theme={theme}>
				<PageHeader
					{...defaultPageHeaderProps}
					breadcrumbs={[
						{
							href: "/NotFound",
							key: "Breadcrumb 1",
							label: "Not Found",
						},
					]}
					title={"Bem vindo, Lucas!"}
					subtitle={"Aqui você pode buscar seus documentos."}
				/>
			</Theme>
			<HTTPError404
				description="A página que você está procurando não existe."
				errorCodeLabel="Erro 404"
				links={[
					{
						href: "https://www.github.com/saogregl",
						text: "Github - Lucas Gregorio",
					},
				]}
				title="Página não encontrada"
			/>
		</div>
	);
};

export default index;
