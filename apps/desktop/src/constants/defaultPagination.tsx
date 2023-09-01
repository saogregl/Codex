export const defaultPaginationProps = {
    backwardText: "Página anterior",
    forwardText: "Próxima página",
    itemsPerPageText: "Itens por página:",
    itemRangeText: (min, max, total) => { return `Itens ${min}-${max} de ${total}` },
    pageRangeText: (current, total) => { return `Página ${current} de ${total}` },
    pageSizes:
        [
            5,
            10,
            15,
            20,
        ]
}