export interface Location {
    city: string | null;
    province: string | null;
    country: string | null;
}
export interface RawProfile {
    fullName: string | null;
    title: string | null;
    location: string | null;
    photo: string | null;
    description: string | null;
    url: string;
}
export interface Profile {
    fullName: string | null;
    title: string | null;
    location: Location | null;
    photo: string | null;
    description: string | null;
    url: string;
}
export interface RawCompanyProfile {
    description: string | null;
    website: string | null;
    url: string | null;
    id: string | null;
    phone: string | null;
    employees: string | null;
    industries: string[] | [];
}
export interface CompanyProfile {
    description: string | null;
    website: string | null;
    url: string | null;
    id: string | null;
    phone: string | null;
    employees: string | null;
    industries: string[] | [];
}
export interface RawExperience {
    title: string | null;
    company: string | null;
    companyLogo: string | null;
    companyUrl: string | null;
    employmentType: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    endDateIsPresent: boolean;
    description: string | null;
}
export interface Experience {
    title: string | null;
    company: string | null;
    companyLogo: string | null;
    companyUrl: string | null;
    employmentType: string | null;
    location: Location | null;
    startDate: string | null;
    endDate: string | null;
    endDateIsPresent: boolean;
    durationInDays: number | null;
    description: string | null;
}
export interface ScraperUserDefinedOptions {
    sessionCookieValue: string;
    keepAlive?: boolean;
    userAgent?: string;
    timeout?: number;
    headless?: boolean;
}
export interface ScraperOptions {
    sessionCookieValue: string;
    keepAlive: boolean;
    userAgent: string;
    timeout: number;
    headless: boolean;
}
