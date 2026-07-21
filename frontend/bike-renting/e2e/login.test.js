describe("Authentication", () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it("shows the login form", async () => {
    await expect(element(by.text("Вход"))).toBeVisible();
    await expect(element(by.text("Войти"))).toBeVisible();
    await expect(element(by.text("Регистрация"))).toBeVisible();
  });
});
