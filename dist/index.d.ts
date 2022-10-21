import puppeteer from 'puppeteer';
import { CompanyProfile, Experience, Profile, ScraperOptions, ScraperUserDefinedOptions } from "./interfaces";
export declare class LinkedInProfileScraper {
    readonly options: ScraperOptions;
    private browser;
    private launched;
    constructor(userDefinedOptions: ScraperUserDefinedOptions);
    setup: () => Promise<void>;
    isPuppeteerLoaded: () => Promise<boolean>;
    private createPage;
    private getBlockedHosts;
    close: (page?: puppeteer.Page | undefined) => Promise<void>;
    checkIfLoggedIn: () => Promise<void>;
    private scrapeUserProfile;
    private scrapeCompanyProfile;
    scrapeProfile: ({ url }: {
        url: string;
    }) => Promise<{
        companyProfile: CompanyProfile;
        userProfile: Profile;
        experiences: Experience[];
    }>;
}
