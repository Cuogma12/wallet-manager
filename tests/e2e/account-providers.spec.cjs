const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('bank/wallet catalog and logos work offline, preserve nicknames, and survive reload/backup', async ({
  page,
  context,
}) => {
  const errors = [];
  const remoteRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).hostname !== 'localhost'
    )
      remoteRequests.push(request.url());
  });
  await page.goto('/app-settings');
  await expect(page.getByText(/^Sẵn sàng offline/)).toBeVisible({
    timeout: 30000,
  });
  await context.setOffline(true);
  await page.goto('/accounts');
  await page.getByText('Chọn ngân hàng / ví điện tử', { exact: true }).click();
  await expect(
    page.getByText('Thêm ví theo dõi, không phải liên kết ngân hàng'),
  ).toBeVisible();
  await expect(page.getByText('Đang đồng bộ', { exact: true })).toHaveCount(0);
  const bankImages = page
    .getByRole('button', { name: /^Thêm ví / })
    .locator('img');
  await expect(bankImages).toHaveCount(20);
  await expect
    .poll(() =>
      bankImages.evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
  await page
    .getByRole('textbox', { name: 'Tìm ngân hàng / ví', exact: true })
    .fill('quan doi');
  const bank = page.getByRole('button', {
    name: 'Thêm ví MBBank',
    exact: true,
  });
  await expect(bank).toBeVisible();
  await expect
    .poll(() =>
      bank
        .locator('img')
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await bank.click();
  await expect(page.getByLabel('Tên ví', { exact: true })).toHaveValue(
    'MBBank',
  );
  await page.getByLabel('Tên ví', { exact: true }).fill('Ví ăn uống');
  await page
    .getByRole('button', {
      name: 'Chọn hoặc đổi ngân hàng / ví điện tử',
      exact: true,
    })
    .click();
  await page
    .getByRole('textbox', { name: 'Tìm ngân hàng / ví', exact: true })
    .fill('TCB');
  await page.getByRole('radio', { name: 'Techcombank', exact: true }).click();
  await expect(page.getByLabel('Tên ví', { exact: true })).toHaveValue(
    'Ví ăn uống',
  );
  await page.getByRole('radio', { name: 'Ví điện tử', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Tìm ngân hàng / ví', exact: true })
    .fill('momo');
  await page.getByRole('radio', { name: 'MoMo', exact: true }).click();
  await expect(page.getByLabel('Tên ví', { exact: true })).toHaveValue(
    'Ví ăn uống',
  );
  await page.getByLabel('Số dư hiện tại (₫)', { exact: true }).fill('500000');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await page.goto('/accounts');
  await page.reload();
  const wallet = page.getByRole('button', {
    name: 'Sửa ví Ví ăn uống',
    exact: true,
  });
  await expect(wallet).toBeVisible();
  await expect
    .poll(() =>
      wallet
        .locator('img')
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await wallet.click();
  await expect(page.getByText('MoMo', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('radio', { name: 'Ví điện tử', exact: true }),
  ).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await page.goto('/app-settings');
  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Xuất bản sao lưu', exact: true })
    .click();
  const download = await downloadPromise;
  const snapshot = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(snapshot.accounts[0].providerId).toBe('momo');
  expect(snapshot.accounts[0].balance).toBe(500000);
  expect(snapshot.transactions).toHaveLength(0);
  await page.goto('/connect-accounts');
  await page.getByRole('radio', { name: 'Ví điện tử', exact: true }).click();
  const walletImages = page
    .getByRole('button', { name: /^Thêm ví / })
    .locator('img');
  await expect(walletImages).toHaveCount(5);
  await expect
    .poll(() =>
      walletImages.evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: test.info().outputPath('wallet-catalog.png'),
    fullPage: true,
  });
  await page
    .getByRole('textbox', { name: 'Tìm ngân hàng / ví', exact: true })
    .fill('Shopee');
  const shopee = page.getByRole('button', {
    name: 'Thêm ví ShopeePay',
    exact: true,
  });
  await expect
    .poll(() =>
      shopee
        .locator('img')
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await page
    .getByRole('textbox', { name: 'Tìm ngân hàng / ví', exact: true })
    .fill('missing');
  await expect(
    page.getByText('Không tìm thấy. Thử tên khác hoặc chọn Khác để tự nhập.'),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Tạo ví khác / tiền mặt', exact: true })
    .click();
  await expect(
    page.getByRole('radio', { name: 'Tiền mặt', exact: true }),
  ).toHaveAttribute('aria-checked', 'true');
  expect(errors).toEqual([]);
  expect(remoteRequests).toEqual([]);
});
