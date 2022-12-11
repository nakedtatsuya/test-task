import fs from "fs";
import {URL} from "url";
import {ElementHandle} from "puppeteer";
describe("Post update", () => {
  beforeAll(async () => {
    await page.goto(`${TARGET_PAGE_URL}/signin`);
    await page.type("[data-test=input-email]", "ninja@progate.com");
    await page.type("[data-test=input-password]", "password");
    await Promise.all([
      page.waitForNavigation(),
      page.click("[data-test=submit]"),
    ]);
  });
  beforeEach(async () => {
    await page.goto(`${TARGET_PAGE_URL}/posts/7/edit`);
  });
  describe("submit success", () => {
    test("display post index page and dialog message [JY9O5qhu2x7FlZ116hRrZ]", async () => {
      await page.$eval(
        "[data-test=textarea-content]",
        el => ((el as HTMLTextAreaElement).value = "update content")
      );
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      const content = await page.$eval(
        "[data-test=post-7] [data-test=post-item-content]",
        el => (el as HTMLElement).innerText
      );
      const message = await page.$eval(
        "[data-test=dialog]",
        el => (el as HTMLElement).innerText
      );
      expect(message).toBe("Post successfully edited");
      expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts`);
      expect(content).toBe("update content");
      await page.reload();
      expect(await page.$("[data-test=dialog]")).toBeNull();
    });
    test("changes post image when image file is selected [uha5_WFNjTDhpIJZWhPNi]", async () => {
      const postImagePath = "__tests__/mock/img/test_image.jpg";
      const imageInput = (await page.$(
        "[data-test=input-image]"
      )) as ElementHandle<HTMLInputElement>;
      await imageInput?.uploadFile(postImagePath);
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await Promise.all([
        page.waitForNavigation(),
        page.goto(`${TARGET_PAGE_URL}/posts/7`),
      ]);

      const href: string = await page.$eval(
        "[data-test=post-image]",
        el => (el as HTMLImageElement).src
      );
      expect(href.includes("/image/posts/")).toBeTruthy();
      const url = new URL(href);
      const fileName = url.pathname.replace("/image/posts/", "");
      const filePath = `public/image/posts/${fileName}`;
      expect(
        fs.readFileSync(postImagePath).equals(fs.readFileSync(filePath))
      ).toBeTruthy();
      fs.unlinkSync(filePath);
    });
    test("does not change post image when image file is empty [wiO_NiH8U9LDSNawP3R7j]", async () => {
      const postImagePath = "__tests__/mock/img/test_image.jpg";
      const imageInput = (await page.$(
        "[data-test=input-image]"
      )) as ElementHandle<HTMLInputElement>;
      await imageInput?.uploadFile(postImagePath);
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await page.goto(`${TARGET_PAGE_URL}/posts/7/edit`);
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await Promise.all([
        page.waitForNavigation(),
        page.goto(`${TARGET_PAGE_URL}/posts/7`),
      ]);
      const newHref = await page.$eval(
        "[data-test=post-image]",
        el => (el as HTMLImageElement).src
      );
      const url = new URL(newHref);
      const fileName = url.pathname.replace("/image/posts/", "");
      const filePath = `public/image/posts/${fileName}`;
      expect(
        fs.readFileSync(postImagePath).equals(fs.readFileSync(filePath))
      ).toBeTruthy();
      fs.unlinkSync(filePath);
    });
  });
  describe("submit failed", () => {
    test("display empty error message [XYDQwwwtuOhKIlZ0Po_bT]", async () => {
      await page.$eval(
        "[data-test=textarea-content]",
        el => ((el as HTMLTextAreaElement).value = "")
      );
      await Promise.all([
        page.waitForSelector("[data-test=error-content]"),
        page.click("[data-test=submit]"),
      ]);
      const message = await page.$eval(
        "[data-test=error-content]",
        el => (el as HTMLElement).innerText
      );
      expect(message).toBe("Content can't be blank");
    });
  });
  afterAll(async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.click("[data-test=header-link-signout]"),
    ]);
  });
});
