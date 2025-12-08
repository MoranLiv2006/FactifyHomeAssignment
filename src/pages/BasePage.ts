import {Page} from "@playwright/test";

export abstract class BasePage {
    protected constructor(protected page: Page) {
    }
}