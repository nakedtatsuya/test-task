describe("Post edit page", () => {
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/signin`);
      await page.type("[data-test=input-email]", "ninja@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await page.goto(`${TARGET_PAGE_URL}/posts/1/edit`);
    });
    test("set form elements [HMJwnOgZycK2SzFC-uu8u]", async () => {
      const action = await page.$eval(
        "[data-test=form]",
        el => (el as HTMLFormElement).action
      );
      const content = await page.$eval(
        "[data-test=textarea-content]",
        el => (el as HTMLInputElement).value
      );
      const postImage = await page.$eval(
        "[data-test=input-image]",
        el => (el as HTMLInputElement).type
      );
      const value = await page.$eval(
        "[data-test=submit]",
        el => (el as HTMLInputElement).value
      );
      expect(new URL(action).pathname).toBe("/posts/1");
      expect(content).toBe("Looking for a good book to read.");
      expect(postImage).toBe("file");
      expect(value).toBe("Save");
    });
    test("display no authorization error [u_wyAolNGjYTZu88IGFbL]", async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/2/edit`);
      const message = await page.$eval(
        "[data-test=dialog]",
        el => (el as HTMLElement).innerText
      );
      expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts`);
      expect(message).toBe("Unauthorized access");
      await page.reload();
      expect(await page.$("[data-test=dialog]")).toBeNull();
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
      await page.goto(`${TARGET_PAGE_URL}/posts/1/edit`);
    });
    test("display sign in required error [w65LXlQ0bzwrMMJ4t888d]", async () => {
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
