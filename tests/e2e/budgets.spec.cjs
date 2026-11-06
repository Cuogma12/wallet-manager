const { test, expect } = require('@playwright/test');

test('real monthly budgets track offline expenses, validate duplicates, edit and delete without changing wallets', async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/manage-account');
  await page.getByLabel('Tên ví', { exact: true }).fill('Ví ngân sách');
  await page.getByLabel('Số dư hiện tại (₫)', { exact: true }).fill('1000000');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await page.goto('/app-settings');
  await expect(page.getByText(/^Sẵn sàng offline/)).toBeVisible({
    timeout: 30000,
  });
  await context.setOffline(true);
  await page.goto('/budgets?month=2026-01');
  await expect(
    page.getByText('Tháng này chưa có ngân sách', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Thêm ngân sách', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Tháng sau', exact: true }),
  ).toBeDisabled();
  const amount = page.getByLabel('Hạn mức (₫)', { exact: true });
  await amount.fill('0');
  await page
    .getByRole('button', { name: 'Lưu ngân sách', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('Nhập số tiền nguyên');
  await amount.fill('100.000');
  await amount.focus();
  const box = await amount.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  await page
    .getByRole('button', { name: 'Lưu ngân sách', exact: true })
    .click();
  await expect(amount).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText('Đã chi 0 ₫ / hạn mức 100.000 ₫', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Tháng sau', exact: true }).click();
  await expect(
    page.getByText('Tháng này chưa có ngân sách', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Tháng trước', exact: true }).click();
  await page
    .getByRole('button', { name: 'Thêm ngân sách', exact: true })
    .click();
  await page.getByRole('button', { name: 'Ăn uống', exact: true }).click();
  await amount.fill('200000');
  await page
    .getByRole('button', { name: 'Lưu ngân sách', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Danh mục này đã có hạn mức',
  );
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();

  for (const [value, status] of [
    ['80000', 'Sắp chạm hạn mức · 80%'],
    ['20000', 'Đã dùng hết hạn mức · 100%'],
    ['20000', 'Đã vượt hạn mức · 120%'],
  ]) {
    await page.goto('/add');
    await page
      .getByRole('button', { name: 'Chỉnh chi tiết', exact: true })
      .click();
    await page
      .getByRole('textbox', { name: 'SỐ TIỀN', exact: true })
      .fill(value);
    await page
      .getByLabel('Tên giao dịch', { exact: true })
      .fill('Ăn theo ngân sách');
    await page.getByLabel('Ngày giao dịch', { exact: true }).fill('15/01/2026');
    await page
      .getByRole('button', { name: 'Lưu giao dịch', exact: true })
      .click();
    await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
    await page.goto('/budgets?month=2026-01');
    await expect(page.getByText(status, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByText('Vượt hạn mức 20.000 ₫', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Sửa ngân sách Ăn uống', exact: true })
    .click();
  await amount.fill('200000');
  await page
    .getByRole('button', { name: 'Lưu ngân sách', exact: true })
    .click();
  await expect(page.getByText('Đã dùng 60%', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Xóa ngân sách Ăn uống', exact: true })
    .click();
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(page.getByText('Đã dùng 60%', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Xóa ngân sách Ăn uống', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Xác nhận xóa ngân sách', exact: true })
    .click();
  await expect(
    page.getByText('Tháng này chưa có ngân sách', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Chi ở danh mục chưa đặt hạn mức: 120.000 ₫.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('Tháng này chưa có ngân sách', { exact: true }),
  ).toBeVisible();
  await page.goto('/accounts');
  await expect(
    page.getByRole('button', { name: 'Sửa ví Ví ngân sách', exact: true }),
  ).toContainText('880.000 ₫');
  await page.goto('/transactions?month=2026-01');
  await expect(
    page.getByText('Ăn theo ngân sách', { exact: true }),
  ).toHaveCount(3);
  expect(errors).toEqual([]);
});
