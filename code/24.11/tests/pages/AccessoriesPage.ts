import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccessoriesPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async openAccessories() {
        await this.open('/accessories-and-parts/');
    }

    async checkHeading() {
        return await this.page.locator('h1').isVisible();
    }

    async findComponent(name: string) {
        return await this.page.getByText(name, {
            exact: false
        }).first().isVisible();
    }
}
