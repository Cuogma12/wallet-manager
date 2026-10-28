const { test, expect } = require('@playwright/test');

async function setup(page) {
  await page.goto('/manage-account');
  await page
    .getByRole('textbox', { name: 'Tên ví', exact: true })
    .fill('Ví ngày giao dịch');
  await page
    .getByRole('textbox', { name: 'Số dư hiện tại (₫)', exact: true })
    .fill('1000000');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await page.goto('/add');
}

test('today/yesterday shortcuts and calendar save a backdated expense in its selected month offline', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await setup(page);
  const dates = await page.evaluate(() => {
    const format = (date) =>
      `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const previous = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      15,
      12,
    );
    return {
      today: format(today),
      yesterday: format(yesterday),
      selected: format(previous),
      month: `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`,
      currentMonth: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
    };
  });
  const date = page.getByRole('textbox', {
    name: 'Ngày giao dịch',
    exact: true,
  });
  await expect(date).toHaveValue(dates.today);
  await page.getByRole('button', { name: 'Hôm qua', exact: true }).click();
  await expect(date).toHaveValue(dates.yesterday);
  await page.getByRole('button', { name: 'Hôm nay', exact: true }).click();
  await expect(date).toHaveValue(dates.today);
  await page.goto('/app-settings');
  await expect(page.getByText(/^Sẵn sàng offline/)).toBeVisible({
    timeout: 30000,
  });
  await context.setOffline(true);
  await page.goto('/add');
  await page
    .getByRole('button', { name: 'Chọn ngày trên lịch', exact: true })
    .click();
  await page.getByRole('button', { name: 'Tháng trước', exact: true }).click();
  const day = page.getByRole('button', {
    name: `Chọn ngày ${dates.selected}`,
    exact: true,
  });
  const box = await day.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await day.click();
  await expect(date).toHaveValue(dates.selected);
  await expect(
    page.getByRole('button', { name: 'Tháng trước', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('textbox', { name: 'SỐ TIỀN', exact: true })
    .pressSequentially('50000', { delay: 30 });
  await page
    .getByRole('textbox', { name: 'Tên giao dịch', exact: true })
    .fill('Chi tháng trước');
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto(`/transactions?month=${dates.month}`);
  await expect(
    page.getByText('Chi tháng trước', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByText('Chi tháng trước', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Sửa giao dịch', exact: true })
    .click();
  await expect(date).toHaveValue(dates.selected);
  await page.goto(`/transactions?month=${dates.currentMonth}`);
  await expect(page.getByText('Chi tháng trước', { exact: true })).toHaveCount(
    0,
  );
  await page.goto('/accounts');
  await expect(
    page.getByRole('button', { name: 'Sửa ví Ví ngày giao dịch', exact: true }),
  ).toContainText('950.000 ₫');
});

test('invalid dates do not save; typed leap day is preserved for income and calendar navigation crosses years', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('button', { name: 'Thu nhập', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'SỐ TIỀN', exact: true })
    .fill('200000');
  await page
    .getByRole('textbox', { name: 'Tên giao dịch', exact: true })
    .fill('Thu ngày nhuận');
  const date = page.getByRole('textbox', {
    name: 'Ngày giao dịch',
    exact: true,
  });
  for (const value of ['', '31/02/2026', '29/02/2025']) {
    await date.fill(value);
    await page
      .getByRole('button', { name: 'Lưu giao dịch', exact: true })
      .click();
    await expect(
      page.getByText('Nhập ngày có thật theo định dạng DD/MM/YYYY.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/add(?:[?#]|$)/);
  }
  await date.fill('31/12/2025');
  await page
    .getByRole('button', { name: 'Chọn ngày trên lịch', exact: true })
    .click();
  await page.getByRole('button', { name: 'Tháng sau', exact: true }).click();
  await page
    .getByRole('button', { name: 'Chọn ngày 01/01/2026', exact: true })
    .click();
  await expect(date).toHaveValue('01/01/2026');
  await date.fill('29/02/2024');
  await page
    .getByRole('button', { name: 'Chọn ngày trên lịch', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Chọn ngày 29/02/2024', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Chọn ngày 29/02/2024', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto('/transactions?month=2024-02');
  await page.getByText('Thu ngày nhuận', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Sửa giao dịch', exact: true })
    .click();
  await expect(date).toHaveValue('29/02/2024');
  await page.goto('/accounts');
  await expect(
    page.getByRole('button', { name: 'Sửa ví Ví ngày giao dịch', exact: true }),
  ).toContainText('1.200.000 ₫');
});
