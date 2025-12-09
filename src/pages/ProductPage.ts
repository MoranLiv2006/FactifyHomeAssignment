import {BasePage} from "./BasePage";
import {Locator, Page} from "@playwright/test";
import ApplicationURL from "../../helpers/ApplicationURL";

export default class ProductPage extends BasePage {

    private productTitle: Locator;
    private productPrice: Locator;
    private quantityField: Locator;
    private addToCartButton: Locator;
    private successMessage: Locator;
    private cartButton: Locator;

    constructor(page: Page) {
        super(page);
        this.productTitle = page.locator("h1[class='product_title entry-title']");
        this.productPrice = page.locator("p[class='price']");
        this.quantityField = page.locator("input[name='quantity']");
        this.addToCartButton = page.locator("button[name='add-to-cart']");
        this.successMessage = page.getByRole("alert")
        this.cartButton = page.locator("a[class='cart-container']");
    }

    public async validateProductUrl() {
        let title = await this.getElementText(this.productTitle);
        if (title === "ATID Green Tshirt") { // if the chosen product is the ATID Green Tshirt, for some reason the url isn't the matched to the product title.
            await this.validateUrl(`${ApplicationURL.BASE_ULR}product/dnk-tshirt/`)
        } else {
            const editedProductTitle = title.toLowerCase().trim().replace(/\s+/g, "-");

            await this.validateUrl(`${ApplicationURL.BASE_ULR}product/${editedProductTitle}/`)
        }
    }

    public async addProductToCart(quantity: number = 1) {
        await this.fillText(this.quantityField, quantity.toString());
        await this.validateAddToCartButtonVisibleOrNot(true);
        await this.clickElement(this.addToCartButton)
        await this.validateElementIsVisible(this.successMessage)
        await this.validateElementText(this.successMessage, await this.getElementText(this.productTitle))
    }

    public async getProductPrice() {
        await this.validateElementIsVisible(this.productPrice)
        let discountTag = " > ins > span"
        if (await this.productPrice.locator(discountTag).count() === 0) {
            return this.getElementText(this.productPrice);
        } else return this.getElementText(this.productPrice.locator(discountTag));
    }

    public async goToCart() {
        await this.clickElement(this.cartButton);
    }

    public async validateAddToCartButtonVisibleOrNot(visible: boolean) {
        if (visible) {
            await this.validateElementIsVisible(this.addToCartButton);
        } else await this.validateElementIsNotVisible(this.addToCartButton);
    }

}