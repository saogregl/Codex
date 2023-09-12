/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from "react";
import { PageHeader } from "@carbon/ibm-products";

import {
	Checkbox,
	Search,
	Dropdown,
	Accordion,
	AccordionItem,
	DatePicker,
} from "@carbon/react";
import {
	Theme,
	// @ts-ignore
	MultiSelect,
	// @ts-ignore
	Pagination,
	// @ts-ignore
	DatePickerInput,
	// @ts-ignore
	Tag,
} from "@carbon/react";
import classnames from "classnames";
import { settings } from "../../constants/settings";
import rspc from "../../lib/query";
import SearchPanel from "../../components/SearchPanel/SearchPanel";
import useQueryParamStore from "../../Stores/searchStore";
import useThemeStore from "../../Stores/themeStore";
import useTags from "../../hooks/useTags";
import DocumentCard from "../../components/ui/DocumentCard";
import DocumentForm, { getTagColor } from "../../components/ui/DocumentForm";
import { defaultPageHeaderProps } from "../../constants/defaultPageHeader";
import { defaultPaginationProps } from "../../constants/defaultPagination";
import useCollections from "../../hooks/useCollections";
import { Collection, Tag as TagObject } from "../../../../../web/src/bindings";
import useFilters from "../../hooks/useFilters";

const index = () => {
	const { theme } = useThemeStore();

	//variables necessary for pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [tearsheetIsOpen, setTearsheetIsOpen] = useState(false);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [paginatedSearchResult, setPaginatedSearchResult] = useState<
		typeof SearchResult
	>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [selectedObject, setSelectedObject] =
		useState<typeof SearchResult[number]>(null);

	const {
		tags,
		collections: collectionsFilter,
		dateRange,
		onlyFavorites,
		getFilteredData,
		setCollections,
		setDateRange,
		setOnlyFavorites,
		setTags,
	} = useFilters();

	const { data: SearchResult } = rspc.useQuery(["search.search", { query }]);
	const { tags: docTags } = useTags();
	const { collections } = useCollections();

	useEffect(() => {
		setTotalItems(
			getFilteredData({ data: SearchResult ? SearchResult : [] }).length,
		);
	}, [
		SearchResult,
		tags,
		collectionsFilter,
		dateRange,
		onlyFavorites,
		currentPage,
		pageSize,
	]);

	useEffect(() => {
		setPaginatedSearchResult(
			SearchResult
				? getFilteredData({ data: SearchResult }).slice(
						(currentPage - 1) * pageSize,
						currentPage * pageSize,
				)
				: [],
		);
	}, [
		SearchResult,
		tags,
		collectionsFilter,
		dateRange,
		onlyFavorites,
		currentPage,
		pageSize,
	]);

	const handlePaginateChange = (e: { page: number; pageSize: number }) => {
		setCurrentPage(e.page);
		setPageSize(e.pageSize);
		setPaginatedSearchResult(
			SearchResult
				? getFilteredData({ data: SearchResult }).slice(
						(e.page - 1) * e.pageSize,
						e.page * e.pageSize,
				)
				: [],
		);
	};

	// On first render we should check if the query is not empty and search:
	useEffect(() => {
		if (persistentQuery !== "") {
			setQuery(persistentQuery);
		}
	}, []);
	const debounceRef = useRef(null);

	const { persistentQuery, setPersistentQuery } = useQueryParamStore();

	const handleQuery = (e) => {
		const value = e.target.value;
		//Check if the event is not clear
		if (e.target.value !== "" && e.target.value != null) {
			setPersistentQuery(e.target.value);
		}
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		debounceRef.current = setTimeout(() => {
			setQuery(value);
		}, 300); // 300ms is the delay after which setQuery will be called
	};

	const FilterMenu = () => {
		return (
			<SearchPanel>
				<Accordion>
					<AccordionItem open title="Tags">
						<MultiSelect
							id="tags-dropdown"
							selectionFeedback="top"
							titleText="Selecione as Tags"
							helperText="Filtre os documentos por tags"
							items={docTags ? docTags : []}
							itemToElement={(tag: TagObject) =>
								tag ? <Tag type={getTagColor(tag)}>{tag?.name}</Tag> : ""
							}
							itemToString={(tag: TagObject) => (tag ? tag.name : "")}
							onChange={(e) => {
								setTags(e.selectedItems);
							}}
							selectedItems={tags}
						/>
					</AccordionItem>
					<AccordionItem open title="Coleções">
						<MultiSelect
							label="Selecione as coleções"
							id="collections-multiselect"
							titleText="Selecione as coleções"
							helperText="Filtre os documentos por coleções"
							items={collections ? collections : []}
							itemToString={(item: Collection) => (item ? item.name : "")}
							selectionFeedback="top"
							onChange={(e) => {
								setCollections(e.selectedItems);
							}}
							selectedItems={collectionsFilter}
						/>
					</AccordionItem>
					<AccordionItem title="Data">
						<DatePicker
							datePickerType="range"
							onChange={(e) => {
								setDateRange({
									start: e[0] ? e[0] : null,
									end: e[1] ? e[1] : null,
								});
							}}
							value={[dateRange.start, dateRange.end]}
						>
							<DatePickerInput
								id="date-picker-input-id-start"
								placeholder="dd/mm/aaaa"
								labelText="Data de início"
								size="md"
							/>
							<DatePickerInput
								id="date-picker-input-id-finish"
								placeholder="dd/mm/aaaa"
								labelText="Data final"
								size="md"
							/>
						</DatePicker>
					</AccordionItem>
					<AccordionItem title="Favoritos">
						<Checkbox
							labelText="Mostrar apenas favoritos"
							id="favorites-checkbox"
							checked={onlyFavorites}
							onChange={(_, { checked, id }) => {
								setOnlyFavorites(checked ? true : false);
							}}
						/>
					</AccordionItem>
				</Accordion>
			</SearchPanel>
		);
	};
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
					pageActions={[
						{
							label: "Inserir novo documento",
							onClick: () => setTearsheetIsOpen(!tearsheetIsOpen),
							kind: "primary",
						},
					]}
				/>
			</Theme>
			<DocumentForm
				selectedObject={selectedObject}
				docTags={docTags}
				open={open}
				setOpen={setOpen}
			/>
			<div
				className={classnames(`${settings.sipePrefix}--main-content-wrapper`)}
			>
				<div className="height-100">
					<div className="flex-column height-100">
						<div className={`${settings.sipePrefix}--data-search-bar-wrapper`}>
							<Search
								labelText={""}
								onChange={handleQuery}
								defaultValue={persistentQuery}
							/>
						</div>
						<div className="flex-row height-100">
							<div className="left-panel">{FilterMenu()}</div>
							<div className="right-panel">
								<p
									className={`${settings.sipePrefix}--search-panel-header-text`}
								>
									Documentos
								</p>
								<div className="scrollable-area">
									{paginatedSearchResult?.map((document) => (
										<DocumentCard
											key={document.object.collectionId + document.object.id}
											document={document}
											setSelectedObject={setSelectedObject}
											setOpen={setOpen}
											open={open}
											tags={document.tags}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="pagination-wrapper">
						<Pagination
							{...defaultPaginationProps}
							onChange={handlePaginateChange}
							page={currentPage}
							pageSize={pageSize}
							size="lg"
							totalItems={totalItems}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default index;
