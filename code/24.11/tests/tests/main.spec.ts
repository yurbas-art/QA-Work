import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home page', () => {
    test('Home page heading is visible', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.openHome();

        await expect(homePage.mainHeading).toBeVisible();
    });

    test('Header is visible', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.openHome();

        await expect(homePage.header).toBeVisible();
    });

    test('Footer is visible', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.openHome();

        await expect(homePage.footer).toBeVisible();
    });
});
