import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async openProducts() {
        await this.open('/products/');
    }

    async checkHeading() {
        return await this.page.locator('h1').isVisible();
    }

    async findProduct(name: string) {
        return await this.page.getByText(name, {
            exact: false
        }).first().isVisible();
    }
}
