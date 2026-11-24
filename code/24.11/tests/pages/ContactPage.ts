import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async openContact() {
        await this.open('/contact/');
    }

    async checkHeading() {
        return await this.page.locator('h1').isVisible();
    }

    async checkEmailLink() {
        return await this.page.locator(
            'a[href^="mailto:"]'
        ).count() > 0;
    }

    async checkPhoneLink() {
        return await this.page.locator(
            'a[href^="tel:"]'
        ).count() > 0;
    }

    async getFormsCount() {
        return await this.page.locator('form').count();
    }
}
