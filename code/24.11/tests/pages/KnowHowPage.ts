import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class KnowHowPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async openKnowHow() {
        await this.open('/know-how/');
    }

    async checkHeading() {
        return await this.page.locator('h1').isVisible();
    }

    async getArticles() {
        return await this.page.locator('article').allInnerTexts();
    }

    async findArticle(name: string) {
        return await this.page.getByText(name, {
            exact: false
        }).first().isVisible();
    }
}
