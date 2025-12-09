import {BasePage} from "./BasePage";
import {expect, Locator, Page} from "@playwright/test";
import {CartTableColumns} from "../../helpers/CartTableColumns";

export default class CartPage extends BasePage {

    private pageTitle: Locator;
    private cartSubTotal: Locator;
    private cartTotal: Locator;
    private shippingOption: Locator;
    private proceedToCheckoutButton: Locator;
    public productsTable: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.getByRole("heading", {level: 1});
        this.cartSubTotal = page.locator("tr[class='cart-subtotal'] > td");
        this.cartTotal = page.locator("td[data-title='Total']");
        this.shippingOption = page.locator("td[data-title='Shipping'] > ul > li");
        this.proceedToCheckoutButton = page.locator("a[class='checkout-button button alt wc-forward']")
        this.productsTable = page.locator("table[class='shop_table shop_table_responsive cart woocommerce-cart-form__contents'] > tbody > tr[class='woocommerce-cart-form__cart-item cart_item']");
    }

    public async validateCartPageTitle(expectedPageTitle: string) {
        await this.validatePageTitle(this.pageTitle, expectedPageTitle)
    }

    public async validateCartItemPricesWithQuantity(productPrice: string) {
        await this.validateElementText(await this.getProductsColumn(0, CartTableColumns.PRODUCT_PRICE), productPrice) // verifies that the item's price in the cart matches the price displayed on the product page.
        let itemPriceInNumber = this.getElementTextValueWithoutSymbols(await this.getElementText(await this.getProductsColumn(0, CartTableColumns.PRODUCT_PRICE)))
        let itemQuantityInNumber = (await this.getProductsColumn(0, CartTableColumns.PRODUCT_QUANTITY)).inputValue();
        let subTotalInNumber = this.getElementTextValueWithoutSymbols(await this.getElementText(await this.getProductsColumn(0, CartTableColumns.PRODUCT_SUBTOTAL)))
        expect(parseFloat(await itemPriceInNumber) * parseFloat(await itemQuantityInNumber)).toBe(parseFloat(await subTotalInNumber))
    }

    public async validateTotalPriceWithShippingOptions() {
        let numberOfShippingOptions = this.shippingOption.count();
        for (let i = 0; i < await numberOfShippingOptions; i++) {
            await this.clickElement(this.shippingOption.nth(i))

            let shippingCostElement = this.shippingOption.nth(i).locator(" > label > span ")
            let shippingCost;
            if (await shippingCostElement.count() === 0) {
                shippingCost = "0 ₪"
            } else {
                await this.page.waitForTimeout(2000);
                shippingCost = await this.getElementText(shippingCostElement);
                console.log(`subTotal ${await this.getElementText(this.cartSubTotal)}, shipping cost ${shippingCost}, total ${await this.getElementText(this.cartTotal)}`);
            }
            await this.validateCartTotalIsEqualToItemAndShippingOptions(shippingCost)
        }
    }

    protected async getElementTextValueWithoutSymbols(elementStringWithSymbol: string) {
        return (elementStringWithSymbol.replace(/[^\d.]/g, ""))
    }

    private async validateCartTotalIsEqualToItemAndShippingOptions(shippingCost: string) {
        let shippingCostFloatValue = parseFloat(await this.getElementTextValueWithoutSymbols(shippingCost));
        let cartSubTotalFloatValue = parseFloat(await this.getElementTextValueWithoutSymbols(await this.getElementText(this.cartSubTotal)))
        let cartTotalFloatValue = parseFloat(await this.getElementTextValueWithoutSymbols(await this.getElementText(this.cartTotal)))
        expect(cartTotalFloatValue).toBe(shippingCostFloatValue + cartSubTotalFloatValue)
    }

    public async goToCheckout() {
        await this.clickElement(this.proceedToCheckoutButton);
    }

    private async getProductsColumn(row: number, column: CartTableColumns) {
        if (column === CartTableColumns.PRODUCT_QUANTITY) {
            return this.productsTable.nth(row).locator(" > td ").nth(column.valueOf()).locator(" > div > input")
        } else return this.productsTable.nth(row).locator(" > td ").nth(column.valueOf())
    }

    public async validateNumberOfItemsInCart(expectNumberOfItemsInCart: number) {
        await this.validateCountIsAsExpected(this.productsTable, expectNumberOfItemsInCart)
    }

    public async removeAllProductsFromCartAndValidate() {
        for (let i = 0; i < await this.productsTable.count(); i++) {
            await this.clickElement(await this.getProductsColumn(i, CartTableColumns.PRODUCT_REMOVE))
        }
        await this.validateNumberOfItemsInCart(0)
    }
}