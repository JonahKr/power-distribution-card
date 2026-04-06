export const getLovelace = () => {
  const root = document
    .querySelector("home-assistant")
    ?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot;

  const resolver =
    root?.querySelector("ha-drawer partial-panel-resolver") ||
    root?.querySelector("app-drawer-layout partial-panel-resolver");

  const huiRoot = ((resolver as any)?.shadowRoot || resolver)
    ?.querySelector<any>("ha-panel-lovelace")
    ?.shadowRoot?.querySelector<any>("hui-root");

  if (huiRoot) {
    const ll = huiRoot.lovelace;
    ll.current_view = huiRoot.___curView;
    return ll;
  }

  return null;
};
