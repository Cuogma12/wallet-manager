const { test, expect } = require('@playwright/test');

test('installed shell starts offline, keeps money after reload, and restores a downloaded backup', async ({
  page,
  context,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/accounts');
  await expect(page.getByText('Bắt đầu với ví đầu tiên')).toBeVisible();
  await page
    .getByRole('button', { name: 'Thêm ví', exact: true })
    .first()
    .click();
  await page.getByLabel('Tên ví', { exact: true }).fill('Ví PWA');
  await page.getByLabel('Số dư hiện tại (₫)', { exact: true }).fill('1000000');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await expect(page.getByText('Ví PWA', { exact: true })).toBeVisible();
  await page.goto('/app-settings');
  await expect(page.getByText(/^Sẵn sàng offline/)).toBeVisible({
    timeout: 30000,
  });
  expect(await page.evaluate(() => typeof indexedDB)).toBe('object');
  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Xuất bản sao lưu', exact: true })
    .click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  await page.goto('/manage-account');
  await page.getByLabel('Tên ví', { exact: true }).fill('Sẽ bị thay thế');
  await page.getByLabel('Số dư hiện tại (₫)', { exact: true }).fill('123');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await page.goto('/app-settings');
  const pickerPromise = page.waitForEvent('filechooser');
  await page
    .getByRole('button', { name: 'Chọn tệp khôi phục', exact: true })
    .click();
  await (await pickerPromise).setFiles(backupPath);
  await expect(
    page.getByText('Thay dữ liệu hiện tại bằng bản sao này?'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Xác nhận thay thế dữ liệu' }),
  ).toBeDisabled();
  await page.getByRole('switch').check();
  await page.getByRole('button', { name: 'Xác nhận thay thế dữ liệu' }).click();
  await expect(page.getByText(/Đã khôi phục dữ liệu/)).toBeVisible();
  await context.setOffline(true);
  await page.goto('/accounts');
  await expect(page.getByText('Ví PWA', { exact: true })).toBeVisible();
  await expect(page.getByText('Sẽ bị thay thế', { exact: true })).toHaveCount(
    0,
  );
  await page.reload();
  await expect(page.getByText('Ví PWA', { exact: true })).toBeVisible();
  await expect(
    page.getByText('1.000.000 ₫', { exact: true }).first(),
  ).toBeVisible();
  await page.goto('/add');
  await page.getByLabel('SỐ TIỀN', { exact: true }).fill('50000');
  await page
    .getByLabel('Tên giao dịch', { exact: true })
    .fill('Ăn trưa offline');
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto('/accounts');
  await expect(
    page.getByText('950.000 ₫', { exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('950.000 ₫', { exact: true }).first(),
  ).toBeVisible();
  await page.goto('/transactions');
  await expect(
    page.getByText('Ăn trưa offline', { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('a second tab cannot overwrite an image already committed by the first tab', async ({
  page,
  context,
}) => {
  await page.goto('/accounts');
  await expect(page.getByText('Bắt đầu với ví đầu tiên')).toBeVisible();
  const other = await context.newPage();
  await other.goto('/accounts');
  await expect(other.getByText('Bắt đầu với ví đầu tiên')).toBeVisible();
  await page
    .getByRole('button', { name: 'Thêm ví', exact: true })
    .first()
    .click();
  await page.getByLabel('Tên ví', { exact: true }).fill('Ví mới nhất');
  await page.getByLabel('Số dư hiện tại (₫)', { exact: true }).fill('1000');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page.getByText('Ví mới nhất', { exact: true })).toBeVisible();
  await other
    .getByRole('button', { name: 'Thêm ví', exact: true })
    .first()
    .click();
  await other.getByLabel('Tên ví', { exact: true }).fill('Không được ghi');
  await other.getByLabel('Số dư hiện tại (₫)', { exact: true }).fill('1');
  await other.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(other.getByText(/Dữ liệu đã thay đổi ở tab khác/)).toBeVisible();
  await other.goto('/accounts');
  await expect(other.getByText('Ví mới nhất', { exact: true })).toBeVisible();
  await expect(other.getByText('Không được ghi', { exact: true })).toHaveCount(
    0,
  );
});

test('missing browser storage capability shows an error, never an in-memory wallet', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'indexedDB', { value: undefined }),
  );
  await page.goto('/');
  await expect(
    page.getByText('Chưa mở được bộ nhớ bền vững của trình duyệt.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lưu ví' })).toHaveCount(0);
});
