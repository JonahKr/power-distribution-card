  /**
   * This Preloads all standard hass components which are not natively avaiable
   * https://discord.com/channels/330944238910963714/351047592588869643/783477690036125747 for more info
   * Update 2022-11-22 : Visual editors in homeassistant have primarily changed to use the ha-form component!
   * 
   */

export const loadHaComponents = () => {
    if (!customElements.get("ha-form")) {
      (customElements.get("hui-button-card") as any)?.getConfigElement();
    }
    if (!customElements.get("ha-entity-picker")) {
      (customElements.get("hui-entities-card") as any)?.getConfigElement();
    }
    if (!customElements.get("paper-tabs")) {
      (customElements.get("hui-stack-card") as any)?.getConfigElement();
    }
};
