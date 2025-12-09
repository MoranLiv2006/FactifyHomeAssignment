import {expect, Locator, Page, test} from "@playwright/test";

export abstract class BasePage {
    protected constructor(protected page: Page) {
    }

    public async validateUrl(url: string) {
        await test.step(`Validating that a correct value of URL ${url}`, async () => {
            await expect(this.page).toHaveURL(url);
        })
    }

    protected async clickElement(element: Locator) {
        await test.step(`Clicking the ${element}`, async () => {
            await element.click();
        })
    }

    protected async fillText(element: Locator, textToFill: string) {
        await test.step(`Filling ${textToFill} into the ${element} element`, async () => {
            await element.fill(textToFill);
        })
    }

    protected async getElementText(element: Locator) {
        return await test.step("Get the element text", async () => {
            return await element.innerText();
        });
    }

    protected async validateElementText(element: Locator, expectedText: string) {
        await test.step(`Validating that a correct element text is ${expectedText}`, async () => {
            await expect(element).toContainText(expectedText);
        })
    }

    protected async validateElementInputValue(element: Locator, expectedInputValue: string) {
        await test.step(`Validate that the element ${element} has the correct value ${expectedInputValue}`,
            async () => {
                await expect(element).toHaveValue(expectedInputValue);
            })
    }

    public async validatePageTitle(pageTitleElement: Locator, expected_title: string) {
        await this.validateElementText(pageTitleElement, expected_title);
    }

    protected async validateElementIsVisible(element: Locator) {
        await test.step(`Validating that the element ${element} is visible`, async () => {
            await expect(element).toBeVisible();
        })
    }

    protected async validateElementIsNotVisible(element: Locator) {
        await test.step(`Validating that the element ${element} is not visible`, async () => {
            await expect(element).not.toBeVisible();
        })
    }

    protected async validateCountIsAsExpected(element: Locator, expectedCount: number) {
        await test.step(`Validating that the element ${element} has count ${expectedCount} as expected`, async () => {
            await expect(element).toHaveCount(expectedCount)
        })
    }
}