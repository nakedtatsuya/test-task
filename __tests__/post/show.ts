import fs from "fs";
import {URL} from "url";
import {ElementHandle} from "puppeteer";

describe("Post show page", () => {
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/signin`);
      await page.type("[data-test=input-email]", "9@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await Promise.all([
        page.waitForSelector("[data-test=submit-like]"),
        page.goto(`${TARGET_PAGE_URL}/posts/14`),
      ]);
    });
    test("display post info [GUUuuP7QHN8O2VpecYkij]", async () => {
      const name = await page.$eval(
        "[data-test=user-name]",
        el => (el as HTMLElement).innerText
      );
      const content = await page.$eval(
        "[data-test=post-content]",
        el => (el as HTMLElement).innerText
      );
      const time = await page.$eval(
        "[data-test=post-time]",
        el => (el as HTMLElement).innerText
      );
      const userImage = await page.$eval(
        "[data-test=user-image]",
        el => (el as HTMLImageElement).src
      );
      expect(name).toBe("for post show");
      expect(content).toBe("show post");
      expect(time).toBe("2021/06/01 02:32");
      expect(userImage).toBe(`${TARGET_PAGE_URL}/image/users/default_user.jpg`);
      expect(await page.$("[data-test=post-image]")).toBeNull();
    });
    test("display post's like info [lnfUMRoEWSSmTvq4yzrnf]", async () => {
      const likeAction = await page.$eval(
        "[data-test=form-like]",
        el => (el as HTMLFormElement).action
      );
      const unLikedicon = await page.$eval(
        "[data-test=favorite-icon]",
        el => (el as HTMLElement).innerText
      );
      const likeCount = await page.$eval(
        "[data-test=like-count]",
        el => (el as HTMLElement).innerText
      );
      const unLikediconStyleFontFamily = await page.$eval(
        "[data-test=favorite-icon]",
        el => window.getComputedStyle(el).getPropertyValue("font-family")
      );
      expect(new URL(likeAction).pathname).toBe("/likes/14");
      expect(unLikedicon).toBe("favorite_border");
      expect(unLikediconStyleFontFamily).toBe('"Material Icons"');
      expect(likeCount).toBe("0");
      await Promise.all([
        page.waitForSelector("[data-test=submit-like]"),
        page.goto(`${TARGET_PAGE_URL}/posts/15`),
      ]);
      const unLikeAction = await page.$eval(
        "[data-test=form-like]",
        el => (el as HTMLFormElement).action
      );
      const likedIcon = await page.$eval(
        "[data-test=favorite-icon]",
        el => (el as HTMLElement).innerText
      );
      expect(new URL(unLikeAction).pathname).toBe("/likes/15");
      expect(likedIcon).toBe("favorite");
    });
    test("display post image [5tRD1Av4hhfCWghgI-Xpc]", async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/new`);
      await page.$eval(
        "[data-test=textarea-content]",
        el =>
          ((el as HTMLTextAreaElement).value =
            "post image content for post show page")
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
      await page.goto(`${TARGET_PAGE_URL}/users/9`);
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=posts-container] [data-test=post-item-content]"),
      ]);

      const href = await page.$eval(
        "[data-test=post-image]",
        el => (el as HTMLImageElement).src
      );
      const url = new URL(href);
      const fileName = url.pathname.replace("/image/posts/", "");
      const filePath = `public/image/posts/${fileName}`;
      expect(
        fs.readFileSync(postImagePath).equals(fs.readFileSync(filePath))
      ).toBeTruthy();
      fs.unlinkSync(filePath);
    });
    afterAll(async () => {
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=header-link-signout]"),
      ]);
    });
  });
  describe("before sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/1`);
    });
    test("display sign in required error [ZANEuqr6wSZravaSbBnTI]", async () => {
      const message = await page.$eval(
        "[data-test=dialog]",
        el => (el as HTMLElement).innerText
      );
      expect(page.url()).toBe(`${TARGET_PAGE_URL}/signin`);
      expect(message).toBe("You must be logged in");
      await page.reload();
      expect(await page.$("[data-test=dialog]")).toBeNull();
    });
  });
});
