describe("Signin page", () => {
  test("render form heading [rA8KfV0pV83bc5_OsdKWB]", async () => {
    await page.goto(`${TARGET_PAGE_URL}/signin`);
    const heading = await page.$eval(
      "[data-test=form-heading]",
      el => (el as HTMLFormElement).innerText
    );
    expect(heading).toBe("Log in");
  });
  test("set form elements [9WAimav2W8uqwKjNcjapi]", async () => {
    await page.goto(`${TARGET_PAGE_URL}/signin`);
    const action = await page.$eval(
      "[data-test=form]",
      el => (el as HTMLFormElement).action
    );
    const email = await page.$eval(
      "[data-test=input-email]",
      el => (el as HTMLInputElement).type
    );
    const password = await page.$eval(
      "[data-test=input-password]",
      el => (el as HTMLInputElement).type
    );
    expect(action).toBe(`${TARGET_PAGE_URL}/signin`);
    expect(email).toBe("email");
    expect(password).toBe("password");
  });
  describe("already signed in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/signin`);
      await page.type("[data-test=input-email]", "ninja@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await page.goto(`${TARGET_PAGE_URL}/signin`);
    });
    test("display posts index page and already signed in message [ZD-JI66_9Lv4OXGNOOSBp]", async () => {
      const message = await page.$eval(
        "[data-test=dialog]",
        el => (el as HTMLElement).innerText
      );
      expect(message).toBe("You are already logged in");
      expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts`);
    });
    afterAll(async () => {
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=header-link-signout]"),
      ]);
    });
  });
});
