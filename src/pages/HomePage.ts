import {BasePage} from "./BasePage";
import {Locator, Page} from "@playwright/test";

export default class HomePage extends BasePage {

    private inStockProducts: Locator;
    private outOfStockProducts: Locator;

    constructor(protected page: Page) {
        super(page);
        this.inStockProducts = page.locator('li.product.instock');
        this.outOfStockProducts = page.locator('li.outofstock');
    }

    public async clickOnAnyInStockProduct() {
        let numberOfInStockProducts = await this.inStockProducts.count();
        let randomProductIndex = Math.floor(Math.random() * numberOfInStockProducts) - 1; // -1 because the index starts from 0
        await this.clickElement(this.inStockProducts.nth(randomProductIndex));
    }

    public async clickOnAnyOutOfStockProducts() {
        let numberOfOutOfStockProducts = await this.outOfStockProducts.count();
        await this.clickElement(this.outOfStockProducts.nth(numberOfOutOfStockProducts - 1));
    }
}

