import { Page } from '@playwright/test';

export class Helpers {
    static async fillField(
        page: Page,
        selector: string,
        value: string
    ) {
        await page.locator(selector).fill(value);
    }

    static async clickButton(
        page: Page,
        selector: string
    ) {
        await page.locator(selector).click();
    }

    static async fillForm(
        page: Page,
        fields: Record<string, string>
    ) {
        for (const [selector, value] of Object.entries(fields)) {
            await page.locator(selector).fill(value);
        }
    }

    static async navigate(page: Page, url: string) {
        await page.goto(url);
    }
}
