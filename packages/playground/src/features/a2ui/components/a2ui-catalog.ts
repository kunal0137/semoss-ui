import type { ComponentType } from "react";
import type { A2uiAdapterProps } from "./a2ui-adapter.types";
import { A2uiButton } from "./a2ui-button";
import { A2uiCard } from "./a2ui-card";
import { A2uiChart } from "./a2ui-chart";
import { A2uiCheckBox } from "./a2ui-check-box";
import { A2uiChoicePicker } from "./a2ui-choice-picker";
import { A2uiColumn } from "./a2ui-column";
import { A2uiDateTimeInput } from "./a2ui-date-time-input";
import { A2uiDivider } from "./a2ui-divider";
import { A2uiIcon } from "./a2ui-icon";
import { A2uiList } from "./a2ui-list";
import { A2uiRemoteMedia } from "./a2ui-remote-media";
import { A2uiRow } from "./a2ui-row";
import { A2uiSlider } from "./a2ui-slider";
import { A2uiTable } from "./a2ui-table";
import { A2uiTabs } from "./a2ui-tabs";
import { A2uiText } from "./a2ui-text";
import { A2uiTextField } from "./a2ui-text-field";

/**
 * The components an agent may ask for: the basic catalog less `Modal`, which a
 * chat card does not need yet, plus `Chart` and `Table`. The list is closed. A name that is not here
 * draws a placeholder, never raw HTML.
 */
export const A2UI_CATALOG: Readonly<
	Record<string, ComponentType<A2uiAdapterProps>>
> = {
	Text: A2uiText,
	Icon: A2uiIcon,
	Image: A2uiRemoteMedia,
	Video: A2uiRemoteMedia,
	AudioPlayer: A2uiRemoteMedia,
	Row: A2uiRow,
	Column: A2uiColumn,
	List: A2uiList,
	Card: A2uiCard,
	Tabs: A2uiTabs,
	Divider: A2uiDivider,
	Chart: A2uiChart,
	Table: A2uiTable,
	Button: A2uiButton,
	TextField: A2uiTextField,
	CheckBox: A2uiCheckBox,
	ChoicePicker: A2uiChoicePicker,
	Slider: A2uiSlider,
	DateTimeInput: A2uiDateTimeInput,
};
