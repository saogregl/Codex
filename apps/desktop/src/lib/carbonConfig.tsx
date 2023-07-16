import { pkg } from "@carbon/ibm-products";
// NOTE: must happen before component is first used
pkg.component.Datagrid = true;
pkg.component.Toolbar = true;
pkg.component.ToolbarGroup = true;
pkg.component.ToolbarButton = true;

export default pkg; 