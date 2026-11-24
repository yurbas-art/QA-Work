import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { AboutPage } from '../pages/AboutPage';
import { KnowHowPage } from '../pages/KnowHowPage';
import { AccessoriesPage } from '../pages/AccessoriesPage';
import { ContactPage } from '../pages/ContactPage';

test('Home page loads', async ({ page }) => {
    const home = new HomePage(page);

    await home.openHome();

    await expect(page.locator('h1')).toBeVisible();
});

test('Products page loads', async ({ page }) => {
    const products = new ProductsPage(page);

    await products.openProducts();

    expect(await products.checkHeading()).toBeTruthy();
});

test('About page loads', async ({ page }) => {
    const about = new AboutPage(page);

    await about.openAbout();

    expect(await about.checkHeading()).toBeTruthy();
});

test('Know How page loads', async ({ page }) => {
    const knowHow = new KnowHowPage(page);

    await knowHow.openKnowHow();

    expect(await knowHow.checkHeading()).toBeTruthy();
});

test('Accessories page loads', async ({ page }) => {
    const accessories = new AccessoriesPage(page);

    await accessories.openAccessories();

    expect(await accessories.checkHeading()).toBeTruthy();
});

test('Contact page loads', async ({ page }) => {
    const contact = new ContactPage(page);

    await contact.openContact();

    expect(await contact.checkHeading()).toBeTruthy();
});
