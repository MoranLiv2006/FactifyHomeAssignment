import {BasePage} from "./BasePage";
import {Locator, Page} from "@playwright/test";

export default class HomePage extends BasePage {

    public inStockProducts: Locator;

    constructor(protected page: Page) {
        super(page);
        this.inStockProducts = page.locator('li.product.instock');
    }
}