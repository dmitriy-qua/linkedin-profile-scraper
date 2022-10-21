import puppeteer, {Page, Browser} from 'puppeteer'
import treeKill from 'tree-kill';

import blockedHostsList from './blocked-hosts';

import {
  getDurationInDays,
  formatDate,
  getCleanText,
  getLocationFromText,
  statusLog,
  getHostname,
} from './utils'
import {SessionExpired} from './errors';
import {
  CompanyProfile,
  Experience,
  Profile,
  RawCompanyProfile,
  RawExperience,
  RawProfile,
  ScraperOptions,
  ScraperUserDefinedOptions
} from "./interfaces";
import {FAKE_COMPANY_URL} from "./constants";


async function autoScroll(page: Page) {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 200;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export class LinkedInProfileScraper {
  readonly options: ScraperOptions = {
    sessionCookieValue: '',
    keepAlive: false,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    headless: true
  }

  private browser: Browser | null = null;
  private launched: boolean = false;

  constructor(userDefinedOptions: ScraperUserDefinedOptions) {
    const logSection = 'constructing';
    const errorPrefix = 'Error during setup.';

    if (!userDefinedOptions.sessionCookieValue) {
      throw new Error(`${errorPrefix} Option "sessionCookieValue" is required.`);
    }

    if (userDefinedOptions.sessionCookieValue && typeof userDefinedOptions.sessionCookieValue !== 'string') {
      throw new Error(`${errorPrefix} Option "sessionCookieValue" needs to be a string.`);
    }

    if (userDefinedOptions.userAgent && typeof userDefinedOptions.userAgent !== 'string') {
      throw new Error(`${errorPrefix} Option "userAgent" needs to be a string.`);
    }

    if (userDefinedOptions.keepAlive !== undefined && typeof userDefinedOptions.keepAlive !== 'boolean') {
      throw new Error(`${errorPrefix} Option "keepAlive" needs to be a boolean.`);
    }

    if (userDefinedOptions.timeout !== undefined && typeof userDefinedOptions.timeout !== 'number') {
      throw new Error(`${errorPrefix} Option "timeout" needs to be a number.`);
    }

    if (userDefinedOptions.headless !== undefined && typeof userDefinedOptions.headless !== 'boolean') {
      throw new Error(`${errorPrefix} Option "headless" needs to be a boolean.`);
    }

    this.options = Object.assign(this.options, userDefinedOptions);

    statusLog(logSection, `Using options: ${JSON.stringify(this.options)}`);
  }

  /**
   * Method to load Puppeteer in memory so we can re-use the browser instance.
   */
  public setup = async () => {
    const logSection = 'setup'

    try {
      statusLog(logSection, `Launching puppeteer in the ${this.options.headless ? 'background' : 'foreground'}...`)

      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: [
          ...(this.options.headless ? '---single-process' : '---start-maximized'),
          '--no-sandbox',
          '--disable-setuid-sandbox',
          "--proxy-server='direct://",
          '--proxy-bypass-list=*',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-features=site-per-process',
          '--enable-features=NetworkService',
          '--allow-running-insecure-content',
          '--enable-automation',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-web-security',
          '--autoplay-policy=user-gesture-required',
          '--disable-background-networking',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-default-apps',
          '--disable-domain-reliability',
          '--disable-extensions',
          '--disable-features=AudioServiceOutOfProcess',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-notifications',
          '--disable-offer-store-unmasked-wallet-cards',
          '--disable-popup-blocking',
          '--disable-print-preview',
          '--disable-prompt-on-repost',
          '--disable-speech-api',
          '--disable-sync',
          '--disk-cache-size=33554432',
          '--hide-scrollbars',
          '--ignore-gpu-blacklist',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-first-run',
          '--no-pings',
          '--no-zygote',
          '--password-store=basic',
          '--use-gl=swiftshader',
          '--use-mock-keychain'
        ],
        timeout: this.options.timeout
      })

      this.launched = true;
      statusLog(logSection, 'Puppeteer launched!')

      await this.checkIfLoggedIn();

      statusLog(logSection, 'Done!')
    } catch (err) {
      // Kill Puppeteer
      await this.close();

      statusLog(logSection, 'An error occurred during setup.')

      throw err
    }
  };

  public isPuppeteerLoaded = async () => {
    return this.launched;
  }

  /**
   * Create a Puppeteer page with some extra settings to speed up the crawling process.
   */
  private createPage = async (): Promise<Page> => {
    const logSection = 'setup page'

    if (!this.browser) {
      throw new Error('Browser not set.');
    }

    // Important: Do not block "stylesheet", makes the crawler not work for LinkedIn
    const blockedResources = ['media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset']; // not blocking image since we want profile pics

    try {
      const page = await this.browser.newPage()

      // Use already open page
      // This makes sure we don't have an extra open tab consuming memory
      const firstPage = (await this.browser.pages())[0];
      await firstPage.close();

      // Method to create a faster Page
      // From: https://github.com/shirshak55/scrapper-tools/blob/master/src/fastPage/index.ts#L113
      const session = await page.target().createCDPSession()
      await page.setBypassCSP(true)
      await session.send('Page.enable');
      await session.send('Page.setWebLifecycleState', {
        state: 'active',
      });

      statusLog(logSection, `Blocking the following resources: ${blockedResources.join(', ')}`)

      // A list of hostnames that are trackers
      // By blocking those requests we can speed up the crawling
      // This is kinda what a normal adblocker does, but really simple
      const blockedHosts = this.getBlockedHosts();
      const blockedResourcesByHost = ['script', 'xhr', 'fetch', 'document']

      statusLog(logSection, `Should block scripts from ${Object.keys(blockedHosts).length} unwanted hosts to speed up the crawling.`);

      // Block loading of resources, like images and css, we dont need that
      await page.setRequestInterception(true);

      page.on('request', (req) => {
        if (blockedResources.includes(req.resourceType())) {
          return req.abort()
        }

        const hostname = getHostname(req.url());

        // Block all script requests from certain host names
        if (blockedResourcesByHost.includes(req.resourceType()) && hostname && blockedHosts[hostname] === true) {
          statusLog('blocked script', `${req.resourceType()}: ${hostname}: ${req.url()}`);
          return req.abort();
        }

        return req.continue()
      })

      await page.setUserAgent(this.options.userAgent)

      await page.setViewport({
        width: 1200,
        height: 720
      })

      statusLog(logSection, `Setting session cookie using cookie: ${process.env.LINKEDIN_SESSION_COOKIE_VALUE}`)

      await page.setCookie({
        'name': 'li_at',
        'value': this.options.sessionCookieValue,
        'domain': '.www.linkedin.com'
      })

      statusLog(logSection, 'Session cookie set!')

      statusLog(logSection, 'Done!')

      return page;
    } catch (err) {
      // Kill Puppeteer
      await this.close();

      statusLog(logSection, 'An error occurred during page setup.')
      statusLog(logSection, err.message)

      throw err
    }
  };

  /**
   * Method to block know hosts that have some kind of tracking.
   * By blocking those hosts we speed up the crawling.
   *
   * More info: http://winhelp2002.mvps.org/hosts.htm
   */
  private getBlockedHosts = (): object => {
    const blockedHostsArray = blockedHostsList.split('\n');

    let blockedHostsObject = blockedHostsArray.reduce((prev, curr) => {
      const frags = curr.split(' ');

      if (frags.length > 1 && frags[0] === '0.0.0.0') {
        prev[frags[1].trim()] = true;
      }

      return prev;
    }, {});

    blockedHostsObject = {
      ...blockedHostsObject,
      'static.chartbeat.com': true,
      'scdn.cxense.com': true,
      'api.cxense.com': true,
      'www.googletagmanager.com': true,
      'connect.facebook.net': true,
      'platform.twitter.com': true,
      'tags.tiqcdn.com': true,
      'dev.visualwebsiteoptimizer.com': true,
      'smartlock.google.com': true,
      'cdn.embedly.com': true,
      'www.pagespeed-mod.com': true,
      'ssl.google-analytics.com': true,
      'radar.cedexis.com': true,
      'sb.scorecardresearch.com': true
    }

    return blockedHostsObject;
  }

  /**
   * Method to complete kill any Puppeteer process still active.
   * Freeing up memory.
   */
  public close = (page?: Page): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      const loggerPrefix = 'close';
      this.launched = false;
      if (page) {
        try {
          statusLog(loggerPrefix, 'Closing page...');
          await page.close();
          statusLog(loggerPrefix, 'Closed page!');
        } catch (err) {
          reject(err)
        }
      }

      if (this.browser) {
        try {
          statusLog(loggerPrefix, 'Closing browser...');
          await this.browser.close();
          statusLog(loggerPrefix, 'Closed browser!');

          const browserProcessPid = this.browser.process().pid;

          // Completely kill the browser process to prevent zombie processes
          // https://docs.browserless.io/blog/2019/03/13/more-observations.html#tip-2-when-you-re-done-kill-it-with-fire
          if (browserProcessPid) {
            statusLog(loggerPrefix, `Killing browser process pid: ${browserProcessPid}...`);

            treeKill(browserProcessPid, 'SIGKILL', (err) => {
              if (err) {
                return reject(`Failed to kill browser process pid: ${browserProcessPid}`);
              }

              statusLog(loggerPrefix, `Killed browser pid: ${browserProcessPid} Closed browser.`);
              resolve()
            });
          }
        } catch (err) {
          reject(err);
        }
      }

      return resolve()
    })

  }

  /**
   * Simple method to check if the session is still active.
   */
  public checkIfLoggedIn = async () => {
    const logSection = 'checkIfLoggedIn';

    const page = await this.createPage();

    statusLog(logSection, 'Checking if we are still logged in...')

    // Go to the login page of LinkedIn
    // If we do not get redirected and stay on /login, we are logged out
    // If we get redirect to /feed, we are logged in
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'networkidle2',
      timeout: this.options.timeout
    })

    const url = page.url()

    const isLoggedIn = !url.endsWith('/login')

    await page.close();

    if (isLoggedIn) {
      statusLog(logSection, 'All good. We are still logged in.')
    } else {
      const errorMessage = 'Bad news, we are not logged in! Your session seems to be expired. Use your browser to login again with your LinkedIn credentials and extract the "li_at" cookie value for the "sessionCookieValue" option.';
      statusLog(logSection, errorMessage)
      throw new SessionExpired(errorMessage)
    }
  };

  /**
   * Method to scrape a user profile.
   */
  private scrapeUserProfile = async ({url}: { url: string }) => {
    const logSection = 'run'

    const scraperSessionId = new Date().getTime();

    if (!this.browser) {
      throw new Error('Browser is not set. Please run the setup method first.')
    }

    if (!url) {
      throw new Error('No profileUrl given.')
    }

    if (!url.includes('linkedin.com/in')) {
      throw new Error('The given URL to scrape is not a user profile linkedin.com url.')
    }

    try {
      // Each run has it's own page
      const page = await this.createPage();

      statusLog(logSection, `Navigating to LinkedIn profile: ${url}`, scraperSessionId)

      await page.goto(url, {
        // Use "networkidle2" here and not "domcontentloaded".
        // As with "domcontentloaded" some elements might not be loaded correctly, resulting in missing data.
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout
      });

      await page.waitFor(3000)

      page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
          console.log(await msgArgs[i].jsonValue());
        }
      });

      statusLog(logSection, 'LinkedIn profile page loaded!', scraperSessionId)

      statusLog(logSection, 'Getting all the LinkedIn profile data by scrolling the page to the bottom, so all the data gets loaded into the page...', scraperSessionId)

      await autoScroll(page);

      statusLog(logSection, 'Parsing profile data...', scraperSessionId)

      const rawUserProfileData: RawProfile = await page.evaluate(() => {
        const profileSection = document.querySelector('.pv-top-card')

        const url = window.location.href

        const fullNameElement = profileSection?.querySelector('.text-heading-xlarge.inline')
        const fullName = fullNameElement?.textContent || null

        const titleElement = profileSection?.querySelector('.text-body-medium.break-words')
        const title = titleElement?.textContent || null

        const locationElement = profileSection?.querySelector('.text-body-small.inline.t-black--light.break-words')
        const location = locationElement?.textContent || null

        const photoElement = profileSection?.querySelector('.pv-top-card-profile-picture__image.pv-top-card-profile-picture__image--show') || profileSection?.querySelector('.profile-photo-edit__preview')
        const photo = photoElement?.getAttribute('src') || null

        const descriptionElement = document.querySelector('.pv-shared-text-with-see-more') // Is outside "profileSection"
        const description = descriptionElement?.textContent || null


        return {
          fullName,
          title,
          location,
          photo,
          description,
          url
        } as RawProfile
      })

      // Convert the raw data to clean data using our utils
      // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
      const userProfile: Profile = {
        ...rawUserProfileData,
        fullName: getCleanText(rawUserProfileData.fullName),
        title: getCleanText(rawUserProfileData.title),
        location: rawUserProfileData.location ? getLocationFromText(rawUserProfileData.location) : null,
        description: getCleanText(rawUserProfileData.description),
      }

      statusLog(logSection, `Got user profile data: ${JSON.stringify(userProfile)}`, scraperSessionId)

      statusLog(logSection, `Parsing experiences data...`, scraperSessionId)

      let experienceIndex = await page.$$eval("main > section.artdeco-card.ember-view", (nodes) => {
        let i = 0;
        let experienceIndex = 0;
        let undefinedCount = 0;

        for (const node of nodes) {
          const headerTitle = node.querySelector(`.pvs-header__container > div > div > div > h2 > span`)?.textContent

          if (headerTitle === undefined) {
            undefinedCount += 1
          }

          if (node.querySelector(`.pvs-header__container > div > div > div > h2 > span`)?.textContent === "Experience") {
            experienceIndex = i
          }

          i++
        }

        return experienceIndex + undefinedCount;
      });

      let rawExperiencesData: RawExperience[] = []

      if (experienceIndex) {
        rawExperiencesData = await page.$$eval(`main > section.artdeco-card.ember-view:nth-child(${experienceIndex}) > div.pvs-list__outer-container > ul.pvs-list > li.artdeco-list__item`, (nodes) => {

          let data: RawExperience[] = []

          // Using a for loop so we can use await inside of it
          for (const node of nodes) {

            let title, employmentType, company, companyLogo, companyUrl, description, startDate, endDate, dateRangeText,
              endDateIsPresent,
              location;

            const titleElement = node.querySelector('div > div.display-flex.flex-column > div.display-flex.flex-row > div > div > span > span.visually-hidden');
            title = titleElement?.textContent || null

            const employmentTypeElement = node.querySelector('div > div.display-flex.flex-column > div.display-flex.flex-row > div.display-flex.flex-column > span:nth-child(2) > span.visually-hidden');
            employmentType = employmentTypeElement?.textContent || null

            const companyElement = employmentTypeElement?.textContent || "";
            let companyData = companyElement?.split("·")?.[0]?.trim() || "";
            company = companyData?.trim() || null;

            const companyLogoElement = node.querySelector('div > a > div.ivm-image-view-model.pvs-entity__image > div.ivm-view-attr__img-wrapper.ivm-view-attr__img-wrapper--use-img-tag.display-flex > img')
            companyLogo = companyLogoElement?.getAttribute('src') || null

            const companyUrlElement = node.querySelector('div > a')
            companyUrl = companyUrlElement?.getAttribute('href') || null

            const descriptionElement = node.querySelector('div > div.display-flex.flex-column.full-width.align-self-center > div.pvs-list__outer-container > ul > li > div > ul > li > div > div > div > div > span.visually-hidden');
            description = descriptionElement?.textContent || null

            const dateRangeElement = node.querySelector('div > div.display-flex.flex-column.full-width.align-self-center > div.display-flex.flex-row.justify-space-between > div.display-flex.flex-column.full-width > span:nth-child(3) > span.visually-hidden');
            dateRangeText = dateRangeElement?.textContent || null

            const startDatePart = dateRangeText?.split('–')?.[0] || null;
            startDate = startDatePart?.trim() || null;

            const endDatePart = dateRangeText?.split('–')?.[1] || null;
            endDateIsPresent = endDatePart?.trim()?.toLowerCase() === 'present' || false;
            endDate = (endDatePart && !endDateIsPresent) ? endDatePart?.trim() : 'Present';

            const locationElement = node.querySelector('div > div.display-flex.flex-column.full-width.align-self-center > div.display-flex.flex-row.justify-space-between > div.display-flex.flex-column.full-width > span:nth-child(4) > span.visually-hidden');
            location = locationElement?.textContent || null;

            data.push({
              title,
              company,
              companyLogo,
              companyUrl,
              employmentType,
              location,
              startDate,
              endDate,
              endDateIsPresent,
              description
            })
          }

          return data;
        });
      }

      // Convert the raw data to clean data using our utils
      // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
      const experiences: Experience[] = rawExperiencesData.map((rawExperience) => {
        const startDate = formatDate(rawExperience.startDate);
        const endDate = formatDate(rawExperience.endDate) || null;
        const endDateIsPresent = rawExperience.endDateIsPresent;

        const durationInDaysWithEndDate = (startDate && endDate && !endDateIsPresent) ? getDurationInDays(startDate, endDate) : null
        const durationInDaysForPresentDate = (endDateIsPresent && startDate) ? getDurationInDays(startDate, new Date()) : null
        const durationInDays = endDateIsPresent ? durationInDaysForPresentDate : durationInDaysWithEndDate;

        let cleanedEmploymentType = getCleanText(rawExperience.employmentType);
        if (cleanedEmploymentType && ![
          'Full-time',
          'Part-time',
          'Self-employed',
          'Freelance',
          'Contract',
          'Seasonal',
          'Internship',
          'Apprenticeship'
        ].includes(cleanedEmploymentType)) {
          cleanedEmploymentType = null;
        }
        return {
          ...rawExperience,
          title: getCleanText(rawExperience.title),
          company: getCleanText(rawExperience.company),
          employmentType: cleanedEmploymentType,
          location: rawExperience?.location ? getLocationFromText(rawExperience.location) : null,
          startDate,
          endDate,
          endDateIsPresent,
          durationInDays,
          description: getCleanText(rawExperience.description)
        }
      })

      statusLog(logSection, `Got experiences data: ${JSON.stringify(experiences)}`, scraperSessionId)

      statusLog(logSection, `Done! Returned profile details for: ${url}`, scraperSessionId)

      if (!this.options.keepAlive) {
        statusLog(logSection, 'Not keeping the session alive.')

        await this.close(page)

        statusLog(logSection, 'Done. Puppeteer is closed.')
      } else {
        statusLog(logSection, 'Done. Puppeteer is being kept alive in memory.')

        // Only close the current page, we do not need it anymore
        await page.close()
      }

      return {
        userProfile,
        experiences,
      }
    } catch (err) {
      // Kill Puppeteer
      await this.close()

      statusLog(logSection, 'An error occurred during a run.')

      // Throw the error up, allowing the user to handle this error himself.
      throw err;
    }
  }

  /**
   * Method to scrape a company profile.
   */
  private scrapeCompanyProfile = async ({url}: { url: string }) => {
    const logSection = 'run'

    const scraperSessionId = new Date().getTime();

    if (!this.browser) {
      throw new Error('Browser is not set. Please run the setup method first.')
    }

    if (!url) {
      throw new Error('No profileUrl given.')
    }

    if (!url.includes('linkedin.com/company')) {
      throw new Error('The given URL to scrape is not a company profile linkedin.com url.')
    }

    try {
      // Each run has it's own page
      const page = await this.createPage();

      statusLog(logSection, `Navigating to LinkedIn profile: ${url}`, scraperSessionId)

      await page.goto(`${url}/about`, {
        // Use "networkidle2" here and not "domcontentloaded".
        // As with "domcontentloaded" some elements might not be loaded correctly, resulting in missing data.
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout
      });

      await page.waitFor(3000)

      page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
          console.log(await msgArgs[i].jsonValue());
        }
      });

      statusLog(logSection, 'LinkedIn profile page loaded!', scraperSessionId)

      statusLog(logSection, 'Getting all the LinkedIn profile data by scrolling the page to the bottom, so all the data gets loaded into the page...', scraperSessionId)

      await autoScroll(page);

      statusLog(logSection, 'Parsing profile data...', scraperSessionId)

      const rawCompanyProfileData: RawCompanyProfile = await page.evaluate(() => {

        let description,
          website: string = "",
          employees: string = "",
          phone: string = "",
          industries: string[] = []

        const profileSection = document.querySelector('.org-grid__content-height-enforcer > div > div > div > section.artdeco-card')

        const descriptionElement = profileSection?.querySelector('p.break-words')
        description = descriptionElement?.textContent || null

        const otherData = profileSection?.querySelector('dl.overflow-hidden')

        const splitters = ["Website", "Phone", "Industry", "Company size", "Headquarters", "Founded", "Specialties"]
        const regex = new RegExp(splitters.reduce((acc, s, i) => acc += `${!i ? "" : "|"}(?=${s})`, ""), "g");

        const data = otherData?.textContent?.replace(/\n/g, "").replace(/  +/g, "").split(regex) || []

        data.forEach(item => {
          const itemType = splitters.find(splitter => item.startsWith(splitter))

          if (itemType) {
            const content = item.replace(itemType, "")

            if (itemType === "Website") {
              website = content
            } else if (itemType === "Industry") {
              industries.push(content)
            } else if (itemType === "Specialties") {
              const regex = new RegExp([", ", "and "].reduce((acc, s, i) => acc += `${!i ? "" : "|"}${s}`, ""), "g");
              const specialties = content.split(regex).filter(s => !!s)
              industries.push(...specialties)
            } else if (itemType === "Company size") {
              employees = content.split("employees")[0] + "employees"
            } else if (itemType === "Phone") {
              phone = content.split("Phone")[0]
            }
          }
        })

        return {
          description,
          website,
          phone,
          industries,
          employees
        } as RawCompanyProfile
      })

      const companyProfile: CompanyProfile = {
        ...rawCompanyProfileData,
        description: getCleanText(rawCompanyProfileData.description),
      }

      statusLog(logSection, `Got company profile data: ${JSON.stringify(companyProfile)}`, scraperSessionId)

      statusLog(logSection, `Done! Returned profile details for: ${url}`, scraperSessionId)

      if (!this.options.keepAlive) {
        statusLog(logSection, 'Not keeping the session alive.')

        await this.close(page)

        statusLog(logSection, 'Done. Puppeteer is closed.')
      } else {
        statusLog(logSection, 'Done. Puppeteer is being kept alive in memory.')

        // Only close the current page, we do not need it anymore
        await page.close()
      }

      return {
        companyProfile,
      }
    } catch (err) {
      // Kill Puppeteer
      await this.close()

      statusLog(logSection, 'An error occurred during a run.')

      // Throw the error up, allowing the user to handle this error himself.
      throw err;
    }
  }

  public scrapeProfile = async ({url}: { url: string }) => {

    const userProfileResult = await this.scrapeUserProfile({url})

    const companyUrl = userProfileResult?.experiences[0]?.companyUrl || FAKE_COMPANY_URL

    const companyProfileResult = await this.scrapeCompanyProfile({url: companyUrl})

    return {
      ...userProfileResult,
      ...companyProfileResult
    }
  }
}
