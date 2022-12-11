import fs from "fs";
import {URL} from "url";
import {ElementHandle} from "puppeteer";

describe("Post create", () => {
  beforeAll(async () => {
    await page.goto(`${TARGET_PAGE_URL}/signin`);
    await page.type("[data-test=input-email]", "8@progate.com");
    await page.type("[data-test=input-password]", "password");
    await Promise.all([
      page.waitForNavigation(),
      page.click("[data-test=submit]"),
    ]);
  });
  beforeEach(async () => {
    await page.goto(`${TARGET_PAGE_URL}/posts/new`);
  });
  describe("submit success", () => {
    test("display post index page and dialog message [yAkGbSfa-V9qqjEctcsiz]", async () => {
      await page.$eval(
        "[data-test=textarea-content]",
        el => ((el as HTMLTextAreaElement).value = "test content")
      );
      const postImagePath = "__tests__/mock/img/test_image.jpg";
      const imageInput = (await page.$(
        "[data-test=input-image]"
      )) as ElementHandle<HTMLInputElement>;
      await imageInput?.uploadFile(postImagePath);
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      const message = await page.$eval(
        "[data-test=dialog]",
        el => (el as HTMLElement).innerText
      );
      expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts`);
      expect(message).toBe("Post successfully created");

      await page.goto(`${TARGET_PAGE_URL}/users/8`);

      const postId = await page.$eval("[data-test=posts-container]", el => {
        const firstChild = el.firstElementChild as HTMLElement;
        return firstChild.dataset.test;
      });
      await page.goto(`${TARGET_PAGE_URL}/posts`);
      /**
       * Due to a bug in ejs rendering, spaces are included, so trim() is used to avoid this. Ex: "test content "
       * The root cause of the problem is unknown, but the following may have something to do with it
       * - ejs notation after the a tag
       * - The presence of an img element instead of a block element
       */
      const content = await page.$eval(
        `[data-test=${postId}] [data-test=post-item-content]`,
        el => (el as HTMLElement).innerText.trim()
      );
      const href = await page.$eval(
        `[data-test=${postId}] [data-test=post-image]`,
        el => (el as HTMLImageElement).src
      );
      expect(content).toBe("test content");
      expect(href.includes("/image/posts/")).toBeTruthy();
      const url = new URL(href);
      const fileName = url.pathname.replace("/image/posts/", "");
      const filePath = `public/image/posts/${fileName}`;
      expect(
        fs.readFileSync(postImagePath).equals(fs.readFileSync(filePath))
      ).toBeTruthy();
      fs.unlinkSync(filePath);
    });
  });
  describe("submit failed", () => {
    test("display empty error message [ug76mtRMLDv30YJ_HdH87]", async () => {
      await Promise.all([
        page.waitForSelector("[data-test=error-content]"),
        page.click("[data-test=submit]"),
      ]);
      const content = await page.$eval(
        "[data-test=error-content]",
        el => (el as HTMLElement).innerText
      );
      expect(content).toBe("Content can't be blank");
    });
  });
  afterAll(async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.click("[data-test=header-link-signout]"),
    ]);
  });
});
