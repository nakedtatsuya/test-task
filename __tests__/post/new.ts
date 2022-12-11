describe("Post new page", () => {
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/signin`);
      await page.type("[data-test=input-email]", "ninja@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await page.goto(`${TARGET_PAGE_URL}/posts/new`);
    });
    test("set form elements [O0h9IHDVFr2Iy4EntppBb]", async () => {
      const action = await page.$eval(
        "[data-test=form]",
        el => (el as HTMLFormElement).action
      );
      const content = await page.$eval(
        "[data-test=textarea-content]",
        el => (el as HTMLInputElement).type
      );
      const postImage = await page.$eval(
        "[data-test=input-image]",
        el => (el as HTMLInputElement).type
      );
      const value = await page.$eval(
        "[data-test=submit]",
        el => (el as HTMLInputElement).value
      );
      expect(new URL(action).pathname).toBe("/posts");
      expect(content).toBe("textarea");
      expect(postImage).toBe("file");
      expect(value).toBe("Post");
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
      await page.goto(`${TARGET_PAGE_URL}/posts/new`);
    });
    test("display sign in required error [f-m_Tsxw_JZMgr7axbxLc]", async () => {
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
