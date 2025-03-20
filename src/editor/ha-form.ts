import type { LitElement } from "lit";

interface HaDurationData {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export type HaFormSchema =
  | HaFormConstantSchema
  | HaFormStringSchema
  | HaFormIntegerSchema
  | HaFormFloatSchema
  | HaFormBooleanSchema
  | HaFormSelectSchema
  | HaFormMultiSelectSchema
  | HaFormTimeSchema
  | HaFormSelector
  | HaFormGridSchema
  | HaFormExpandableSchema;

export interface HaFormBaseSchema {
  name: string;
  // This value is applied if no data is submitted for this field
  default?: HaFormData;
  required?: boolean;
  disabled?: boolean;
  description?: {
    suffix?: string;
    // This value will be set initially when form is loaded
    suggested_value?: HaFormData;
  };
  context?: Record<string, string>;
}

export interface HaFormGridSchema extends HaFormBaseSchema {
  type: "grid";
  flatten?: boolean;
  column_min_width?: string;
  schema: readonly HaFormSchema[];
}

export interface HaFormExpandableSchema extends HaFormBaseSchema {
  type: "expandable";
  flatten?: boolean;
  title?: string;
  icon?: string;
  iconPath?: string;
  expanded?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  schema: readonly HaFormSchema[];
}

export interface HaFormSelector extends HaFormBaseSchema {
  type?: never;
  selector: Selector;
}

export interface HaFormConstantSchema extends HaFormBaseSchema {
  type: "constant";
  value?: string;
}

export interface HaFormIntegerSchema extends HaFormBaseSchema {
  type: "integer";
  default?: HaFormIntegerData;
  valueMin?: number;
  valueMax?: number;
}

export interface HaFormSelectSchema extends HaFormBaseSchema {
  type: "select";
  options: readonly (readonly [string, string])[];
}

export interface HaFormMultiSelectSchema extends HaFormBaseSchema {
  type: "multi_select";
  options:
    | Record<string, string>
    | readonly string[]
    | readonly (readonly [string, string])[];
}

export interface HaFormFloatSchema extends HaFormBaseSchema {
  type: "float";
}

export interface HaFormStringSchema extends HaFormBaseSchema {
  type: "string";
  format?: string;
  autocomplete?: string;
  autofocus?: boolean;
}

export interface HaFormBooleanSchema extends HaFormBaseSchema {
  type: "boolean";
}

export interface HaFormTimeSchema extends HaFormBaseSchema {
  type: "positive_time_period_dict";
}

// Type utility to unionize a schema array by flattening any grid schemas
export type SchemaUnion<
  SchemaArray extends readonly HaFormSchema[],
  Schema = SchemaArray[number],
> = Schema extends HaFormGridSchema | HaFormExpandableSchema
  ? SchemaUnion<Schema["schema"]> | Schema
  : Schema;

export type HaFormDataContainer = Record<string, HaFormData>;

export type HaFormData =
  | HaFormStringData
  | HaFormIntegerData
  | HaFormFloatData
  | HaFormBooleanData
  | HaFormSelectData
  | HaFormMultiSelectData
  | HaFormTimeData;

export type HaFormStringData = string;
export type HaFormIntegerData = number;
export type HaFormFloatData = number;
export type HaFormBooleanData = boolean;
export type HaFormSelectData = string;
export type HaFormMultiSelectData = string[];
export type HaFormTimeData = HaDurationData;

export interface HaFormElement extends LitElement {
  schema: HaFormSchema | readonly HaFormSchema[];
  data?: HaFormDataContainer | HaFormData;
  label?: string;
}


export type Selector =
  | ActionSelector
  | AddonSelector
  | AreaSelector
  | AttributeSelector
  | BooleanSelector
  | ColorRGBSelector
  | ColorTempSelector
  | DateSelector
  | DateTimeSelector
  | DeviceSelector
  | DurationSelector
  | EntitySelector
  | IconSelector
  | LocationSelector
  | MediaSelector
  | NumberSelector
  | ObjectSelector
  | SelectSelector
  | StringSelector
  | TargetSelector
  | TemplateSelector
  | ThemeSelector
  | TimeSelector
  | UiActionSelector;

export interface ActionSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  action: {};
}

export interface AddonSelector {
  addon: {
    name?: string;
    slug?: string;
  };
}

export interface AreaSelector {
  area: {
    entity?: {
      integration?: EntitySelector["entity"]["integration"];
      domain?: EntitySelector["entity"]["domain"];
      device_class?: EntitySelector["entity"]["device_class"];
    };
    device?: {
      integration?: DeviceSelector["device"]["integration"];
      manufacturer?: DeviceSelector["device"]["manufacturer"];
      model?: DeviceSelector["device"]["model"];
    };
    multiple?: boolean;
  };
}

export interface AttributeSelector {
  attribute: {
    entity_id?: string;
  };
}

export interface BooleanSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  boolean: {};
}

export interface ColorRGBSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  color_rgb: {};
}

export interface ColorTempSelector {
  color_temp: {
    min_mireds?: number;
    max_mireds?: number;
  };
}

export interface DateSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  date: {};
}

export interface DateTimeSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  datetime: {};
}

export interface DeviceSelector {
  device: {
    integration?: string;
    manufacturer?: string;
    model?: string;
    entity?: {
      domain?: EntitySelector["entity"]["domain"];
      device_class?: EntitySelector["entity"]["device_class"];
    };
    multiple?: boolean;
  };
}

export interface DurationSelector {
  duration: {
    enable_day?: boolean;
  };
}

export interface EntitySelector {
  entity: {
    integration?: string;
    domain?: string | string[];
    device_class?: string;
    multiple?: boolean;
    include_entities?: string[];
    exclude_entities?: string[];
  };
}

export interface IconSelector {
  icon: {
    placeholder?: string;
    fallbackPath?: string;
  };
}

export interface LocationSelector {
  location: { radius?: boolean; icon?: string };
}

export interface LocationSelectorValue {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface MediaSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  media: {};
}

export interface MediaSelectorValue {
  entity_id?: string;
  media_content_id?: string;
  media_content_type?: string;
  metadata?: {
    title?: string;
    thumbnail?: string | null;
    media_class?: string;
    children_media_class?: string | null;
    navigateIds?: { media_content_type: string; media_content_id: string }[];
  };
}

export interface NumberSelector {
  number: {
    min?: number;
    max?: number;
    step?: number;
    mode?: "box" | "slider";
    unit_of_measurement?: string;
  };
}

export interface ObjectSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  object: {};
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectSelector {
  select: {
    multiple?: boolean;
    custom_value?: boolean;
    mode?: "list" | "dropdown";
    options: string[] | SelectOption[];
  };
}

export interface StringSelector {
  text: {
    multiline?: boolean;
    type?:
      | "number"
      | "text"
      | "search"
      | "tel"
      | "url"
      | "email"
      | "password"
      | "date"
      | "month"
      | "week"
      | "time"
      | "datetime-local"
      | "color";
    suffix?: string;
  };
}

export interface TargetSelector {
  target: {
    entity?: {
      integration?: EntitySelector["entity"]["integration"];
      domain?: EntitySelector["entity"]["domain"];
      device_class?: EntitySelector["entity"]["device_class"];
    };
    device?: {
      integration?: DeviceSelector["device"]["integration"];
      manufacturer?: DeviceSelector["device"]["manufacturer"];
      model?: DeviceSelector["device"]["model"];
    };
  };
}

export interface TemplateSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  template: {};
}

export interface ThemeSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  theme: {};
}
export interface TimeSelector {
  // eslint-disable-next-line @typescript-eslint/ban-types
  time: {};
}

export type UiAction = Exclude<ActionConfig["action"], "fire-dom-event">;

export interface UiActionSelector {
  ui_action: {
    actions?: UiAction[];
  } | null;
}
export interface ToggleActionConfig extends BaseActionConfig {
    action: "toggle";
  }
  
  export interface CallServiceActionConfig extends BaseActionConfig {
    action: "call-service" | "perform-action";
    /** @deprecated "service" is kept for backwards compatibility. Replaced by "perform_action". */
    service?: string;
    perform_action: string;
    target?: any;
    /** @deprecated "service_data" is kept for backwards compatibility. Replaced by "data". */
    service_data?: Record<string, unknown>;
    data?: Record<string, unknown>;
  }
  
  export interface NavigateActionConfig extends BaseActionConfig {
    action: "navigate";
    navigation_path: string;
  }
  
  export interface UrlActionConfig extends BaseActionConfig {
    action: "url";
    url_path: string;
  }
  
  export interface MoreInfoActionConfig extends BaseActionConfig {
    action: "more-info";
  }
  
  export interface NoActionConfig extends BaseActionConfig {
    action: "none";
  }
  
  export interface CustomActionConfig extends BaseActionConfig {
    action: "fire-dom-event";
  }
  
  export interface AssistActionConfig extends BaseActionConfig {
    action: "assist";
    pipeline_id?: string;
    start_listening?: boolean;
  }
  
  export interface BaseActionConfig {
    action: string;
    confirmation?: ConfirmationRestrictionConfig;
  }
  
  export interface ConfirmationRestrictionConfig {
    text?: string;
    exemptions?: RestrictionConfig[];
  }
  
  export interface RestrictionConfig {
    user: string;
  }
  
  export type ActionConfig =
    | ToggleActionConfig
    | CallServiceActionConfig
    | NavigateActionConfig
    | UrlActionConfig
    | MoreInfoActionConfig
    | AssistActionConfig
    | NoActionConfig
    | CustomActionConfig;