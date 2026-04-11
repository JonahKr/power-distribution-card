import { repository } from "../../package.json";

export function registerCustomCard(type: string, name: string, description: string): void {
    const windowWithCards = window as unknown as Window & {
        customCards: unknown[];
    };

    windowWithCards.customCards = windowWithCards.customCards || [];

    windowWithCards.customCards.push({
        type,
        name,
        description,
        preview: true,
        documentationURL: `${repository.url}/readme.md`,
    });
}
