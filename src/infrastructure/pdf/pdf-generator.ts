import puppeteer, { type Browser, type Page, type PDFOptions } from "puppeteer";

export class PdfGenerator {
  private browser?: Browser;

  async generateFromHtml(
    html: string,
    options: PDFOptions = {},
  ): Promise<Buffer> {
    /*
     * A Chromium process can terminate while the PdfGenerator
     * instance remains alive.
     *
     * In that situation Puppeteer still leaves us with a Browser
     * object, but browser.newPage() fails with:
     *
     *   ConnectionClosedError: Connection closed.
     *
     * Try once with the current browser and, if its connection
     * has died, recreate Chromium and retry the PDF generation.
     */
    try {
      return await this.generateWithBrowser(html, options);
    } catch (error) {
      if (!this.isConnectionClosedError(error)) {
        throw error;
      }

      await this.disposeBrowser();

      return await this.generateWithBrowser(html, options);
    }
  }

  async close(): Promise<void> {
    await this.disposeBrowser();
  }

  private async generateWithBrowser(
    html: string,
    options: PDFOptions,
  ): Promise<Buffer> {
    const browser = await this.getBrowser();

    let page: Page | undefined;

    try {
      page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: "load",
      });

      await page.waitForNetworkIdle({
        idleTime: 500,
        timeout: 10000,
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        ...options,
      });

      return Buffer.from(pdf);
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch {
          /*
           * Chromium may already be disconnected.
           * There is nothing else to clean up for this Page.
           */
        }
      }
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) {
      return this.browser;
    }

    await this.disposeBrowser();

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    /*
     * Do not keep a dead Browser reference after Chromium exits
     * or its DevTools connection is lost.
     */
    browser.once("disconnected", () => {
      if (this.browser === browser) {
        this.browser = undefined;
      }
    });

    this.browser = browser;

    return browser;
  }

  private async disposeBrowser(): Promise<void> {
    const browser = this.browser;

    this.browser = undefined;

    if (!browser) {
      return;
    }

    if (!browser.connected) {
      return;
    }

    try {
      await browser.close();
    } catch {
      /*
       * Ignore shutdown errors. The important part is that the
       * dead Browser reference has already been discarded.
       */
    }
  }

  private isConnectionClosedError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.name === "ConnectionClosedError" ||
      error.message.toLowerCase().includes("connection closed") ||
      error.message.toLowerCase().includes("target closed")
    );
  }
}
