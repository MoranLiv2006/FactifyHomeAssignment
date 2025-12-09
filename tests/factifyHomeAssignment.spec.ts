import {expect, Page, test} from "@playwright/test";
import ApplicationURL from "../helpers/ApplicationURL";
import HomePage from "../src/pages/HomePage";
import ProductPage from "../src/pages/ProductPage";
import CartPage from "../src/pages/CartPage";
import CheckoutPage from "../src/pages/CheckoutPage";
import {PageTitles} from "../helpers/PageTitles";
import {CustomerInformation} from "../helpers/CustomerInformation";

test.describe("Factify Automation Home-Assignment", () => {

    let homePage: HomePage;
    let productPage: ProductPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;

    test.beforeEach(async ({page}) => {
        homePage = new HomePage(page);
        productPage = new ProductPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);

        await page.goto(ApplicationURL.STORE_ULR);
        await homePage.validateUrl(ApplicationURL.STORE_ULR)
    })

    test("Guest checkout journey", async () => {
        await homePage.clickOnAnyInStockProduct();
        await productPage.validateProductUrl();
        await productPage.addProductToCart(2);

        let productPrice = await productPage.getProductPrice();

        await productPage.goToCart();

        await cartPage.validateUrl(ApplicationURL.CART_ULR);
        await cartPage.validateCartPageTitle(PageTitles.CART_PAGE.valueOf());


        await cartPage.validateCartItemPricesWithQuantity(productPrice);
        await cartPage.validateTotalPriceWithShippingOptions();
        await cartPage.goToCheckout();

        await checkoutPage.validateUrl(ApplicationURL.CHECKOUT_ULR);
        await checkoutPage.validateCheckoutPageTitle(PageTitles.CHECKOUT_PAGE.valueOf());
        await checkoutPage.validateCheckoutFormAppears();
        await checkoutPage.validateCustomerInfoFieldsVisible();
        await checkoutPage.fillMyInformation(CustomerInformation.FIRST_NAME, CustomerInformation.LAST_NAME,
            CustomerInformation.COUNTRY, CustomerInformation.ADDRESS, CustomerInformation.ZIPCODE,
            CustomerInformation.CITY, CustomerInformation.PHONE_NUMBER, CustomerInformation.EMAIL.valueOf());
        await checkoutPage.goBackToCheckout();
        await checkoutPage.validateCustomerInformationFormPersistence();
        await checkoutPage.goBackToCheckout();
        await cartPage.removeAllProductsFromCartAndValidate();
    })

    test("Checkout form validation and data persistence", async () => {
        await homePage.clickOnAnyInStockProduct();
        await productPage.validateProductUrl();
        await productPage.addProductToCart(1);

        await productPage.goToCart();

        await cartPage.validateUrl(ApplicationURL.CART_ULR);
        await cartPage.validateCartPageTitle(PageTitles.CART_PAGE.valueOf());

        await cartPage.goToCheckout();

        await checkoutPage.validateUrl(ApplicationURL.CHECKOUT_ULR);
        await checkoutPage.validateCheckoutPageTitle(PageTitles.CHECKOUT_PAGE.valueOf());

        await checkoutPage.fillMyInformation(CustomerInformation.FIRST_NAME, CustomerInformation.LAST_NAME,
            CustomerInformation.COUNTRY, CustomerInformation.ADDRESS, CustomerInformation.ZIPCODE,
            CustomerInformation.CITY, CustomerInformation.PHONE_NUMBER, "");
        await checkoutPage.placeAnOrder();
        await checkoutPage.validateEmailErrorMessageAppeared(true);
        await checkoutPage.validateCustomerInformationFormPersistence();

        await checkoutPage.fillMyInformation(CustomerInformation.FIRST_NAME, CustomerInformation.LAST_NAME,
            CustomerInformation.COUNTRY, CustomerInformation.ADDRESS, CustomerInformation.ZIPCODE,
            CustomerInformation.CITY, CustomerInformation.PHONE_NUMBER, CustomerInformation.EMAIL.valueOf());
        await checkoutPage.placeAnOrder();
        await checkoutPage.validateEmailErrorMessageAppeared(false);
    })

    test("Out-of-stock behaviour and session isolation", async ({browser}) => {
        await homePage.clickOnAnyOutOfStockProducts();
        await productPage.validateProductUrl();
        await productPage.validateAddToCartButtonVisibleOrNot(false);

        //Session isolation part:
        // context1
        const context1 = await browser.newContext();
        const page1 = await context1.newPage();

        let homePage1 = new HomePage(page1);
        let productPage1 = new ProductPage(page1);
        let cartPage1 = new CartPage(page1);

        // context2
        const context2 = await browser.newContext();
        const page2 = await context2.newPage();

        let homePage2 = new HomePage(page2);
        let productPage2 = new ProductPage(page2);
        let cartPage2 = new CartPage(page2);

        let productPrice1 = await sharedActionsOfEachContext(page1, homePage1, productPage1, cartPage1);
        let productPrice2 = await sharedActionsOfEachContext(page2, homePage2, productPage2, cartPage2);

        // validate each context cart count and total are independent
        await cartPage1.validateCartItemPricesWithQuantity(productPrice1);
        await cartPage2.validateCartItemPricesWithQuantity(productPrice2);
        expect(productPrice1).not.toBe(productPrice2)

        // in context1 remove all items from cart, verify context2 cart is unchanged
        await cartPage1.removeAllProductsFromCartAndValidate();
        await cartPage2.validateNumberOfItemsInCart(1)
    })

    async function sharedActionsOfEachContext(page: Page, homePage: HomePage, productPage: ProductPage, cartPage: CartPage) {
        await page.goto(ApplicationURL.STORE_ULR);
        await homePage.validateUrl(ApplicationURL.STORE_ULR);
        await homePage.clickOnAnyInStockProduct();
        await productPage.validateProductUrl();
        await productPage.addProductToCart(1);
        let productPrice = await productPage.getProductPrice();

        await productPage.goToCart();

        await cartPage.validateUrl(ApplicationURL.CART_ULR);
        await cartPage.validateCartPageTitle(PageTitles.CART_PAGE.valueOf());
        return productPrice;
    }

})