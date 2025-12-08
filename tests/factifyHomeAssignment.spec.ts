import {test} from "@playwright/test";
import ApplicationURL from "../helpers/ApplicationURL";
import HomePage from "../src/pages/HomePage";

test.describe("Positive Login Scenarios", () => {

    let homePage: HomePage;
    // let productsPage: ProductsPage;

    test.beforeEach(async ({page}) => {
        await page.goto(ApplicationURL.HOME_PAGE_ULR);
        homePage = new HomePage(page);
    })

    test("Login with standard_user", async () => {
        console.log("dd")
        console.log(await homePage.inStockProducts.count())

    })
})