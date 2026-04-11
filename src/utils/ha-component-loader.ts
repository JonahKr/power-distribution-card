
export const loadHaComponents = () => {
    if (!customElements.get("ha-entity-picker")) {
      loadCustomElement("hui-entities-card").then((el: any) => el?.getConfigElement());
    }
};

export const loadCustomElement = async <T = any>(name: string) => {
  let Component = customElements.get(name) as T;
  if (Component) {
    return Component;
  }
  await customElements.whenDefined(name);
  return customElements.get(name) as T;
};