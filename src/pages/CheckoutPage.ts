import {BasePage} from "./BasePage";
import {expect, Locator, Page} from "@playwright/test";
import {CustomerInformation} from "../../helpers/CustomerInformation";

export default class CheckoutPage extends BasePage {

    private pageTitle: Locator;
    private checkoutForm: Locator;
    private firstNameInput: Locator;
    private lastNameInput: Locator;
    private addressInput: Locator;
    private countriesDropdownButton: Locator;
    private countryDropdownInput: Locator;
    private countryResult: Locator;
    private zipcodeInput: Locator;
    private cityInput: Locator;
    private phoneInput: Locator;
    private emailInput: Locator;
    private placeOrderButton: Locator;
    private emailMissingErrorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.getByRole("heading", {level: 1});
        this.checkoutForm = this.page.locator("form[name='checkout']");
        this.firstNameInput = this.page.locator("input[id='billing_first_name']");
        this.lastNameInput = this.page.locator("input[id='billing_last_name']");
        this.addressInput = this.page.locator("input[id='billing_address_1']");
        this.countriesDropdownButton = this.page.locator("span[id='select2-billing_country-container']");
        this.countryDropdownInput = this.page.locator("input[class='select2-search__field']");
        this.countryResult = this.page.getByRole("listbox");
        this.zipcodeInput = this.page.locator("input[id='billing_postcode']");
        this.cityInput = this.page.locator("input[id='billing_city']");
        this.phoneInput = this.page.locator("input[id='billing_phone']");
        this.emailInput = this.page.locator("input[id='billing_email']");
        this.placeOrderButton = this.page.locator("button[id='place_order']");
        this.emailMissingErrorMessage = this.page.getByRole("alert").locator(" > li[data-id='billing_email']")
    }

    public async validateCheckoutFormAppears() {
        await this.validateElementIsVisible(this.checkoutForm);
    }

    public async validateCustomerInfoFieldsVisible() {
        await this.validateElementIsVisible(this.firstNameInput);
        await this.validateElementIsVisible(this.lastNameInput);
        await this.validateElementIsVisible(this.addressInput);
        await this.validateElementIsVisible(this.emailInput);
    }

    public async validateCheckoutPageTitle(expectedPageTitle: string) {
        await this.validatePageTitle(this.pageTitle, expectedPageTitle)
    }

    private async chooseCountryInDropdown(country: string) {
        await this.clickElement(this.countriesDropdownButton);
        await this.fillText(this.countryDropdownInput, country);
        await expect(this.countryResult).toHaveCount(1)
        await this.clickElement(this.countryResult.filter({hasText: country}))
    }

    private async fillIfEmpty(locator: Locator, value: string) {
        if (await locator.inputValue() === "") {
            await locator.fill(value);
            await this.fillText(locator, value)
        }
    }

    public async fillMyInformation(firstName: CustomerInformation, lastName: CustomerInformation,
                                   country: CustomerInformation, address: CustomerInformation,
                                   zipcode: CustomerInformation, city: CustomerInformation, phone: CustomerInformation,
                                   email: string) {
        await this.fillIfEmpty(this.firstNameInput, firstName.valueOf());
        await this.fillIfEmpty(this.lastNameInput, lastName.valueOf());
        await this.chooseCountryInDropdown(country.valueOf());
        await this.fillIfEmpty(this.addressInput, address.valueOf());
        await this.fillIfEmpty(this.zipcodeInput, zipcode.valueOf());
        await this.fillIfEmpty(this.cityInput, city.valueOf());
        await this.fillIfEmpty(this.phoneInput, phone.valueOf());
        await this.fillIfEmpty(this.emailInput, email)
    }

    public async goBackToCheckout() {
        await this.page.goBack()

        await this.page.waitForTimeout(1500);
    }

    public async validateCustomerInformationFormPersistence() {
        await this.page.goForward()
        await this.validateElementInputValue(this.firstNameInput, CustomerInformation.FIRST_NAME.valueOf());
        await this.validateElementInputValue(this.lastNameInput, CustomerInformation.LAST_NAME.valueOf());
        await this.validateElementText(this.countriesDropdownButton, CustomerInformation.COUNTRY.valueOf());
        await this.validateElementInputValue(this.addressInput, CustomerInformation.ADDRESS.valueOf());
        await this.validateElementInputValue(this.zipcodeInput, CustomerInformation.ZIPCODE.valueOf());
        await this.validateElementInputValue(this.cityInput, CustomerInformation.CITY.valueOf());
        await this.validateElementInputValue(this.phoneInput, CustomerInformation.PHONE_NUMBER.valueOf());
        if (!await this.emailMissingErrorMessage.isVisible()) {
            await this.validateElementInputValue(this.emailInput, CustomerInformation.EMAIL.valueOf());
        }

    }

    public async placeAnOrder() {
        await this.clickElement(this.placeOrderButton);
    }

    public async validateEmailErrorMessageAppeared(visible: boolean) {
        if (visible) {
            await this.validateElementIsVisible(this.emailMissingErrorMessage);
            await this.validateElementText(this.emailMissingErrorMessage, "Billing Email address is a required field.");
        } else await expect(this.emailMissingErrorMessage).not.toBeVisible();

    }


}