const { test, expect } = require('@playwright/test');

async function openForm(page) {
  await page.goto('/manage-account');
  await page
    .getByRole('textbox', { name: 'Tên ví', exact: true })
    .fill('Ví test số tiền');
  await page
    .getByRole('textbox', { name: 'Số dư hiện tại (₫)', exact: true })
    .fill('1000000');
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
  await page.goto('/add');
}

test('typing/editing and focus changes keep raw digits stable, with a separate formatted preview and exact saved money', async ({
  page,
}) => {
  await openForm(page);
  const amount = page.getByRole('textbox', { name: 'SỐ TIỀN', exact: true });
  const title = page.getByRole('textbox', {
    name: 'Tên giao dịch',
    exact: true,
  });
  await amount.click();
  await amount.pressSequentially('50000', { delay: 30 });
  await expect(amount).toHaveValue('50000');
  await title.click();
  await expect(amount).toHaveValue('50000');
  await expect(
    page.getByText('Giá trị: 50.000 ₫', { exact: true }),
  ).toBeVisible();
  await amount.click();
  await expect(amount).toHaveValue('50000');
  // Insert/delete in the middle, not just append or fill the whole value.
  await amount.evaluate((input) => input.setSelectionRange(1, 1));
  await amount.pressSequentially('2');
  await expect(amount).toHaveValue('520000');
  await amount.press('Backspace');
  await expect(amount).toHaveValue('50000');
  await amount.press('End');
  await amount.press('Backspace');
  await expect(amount).toHaveValue('5000');
  await amount.pressSequentially('0');
  await expect(amount).toHaveValue('50000');
  await amount.press('ControlOrMeta+A');
  await amount.press('Backspace');
  await expect(amount).toHaveValue('');
  // A valid grouped paste is still accepted and normalizes before refocusing.
  await amount.fill('1.200.000');
  await title.click();
  await expect(amount).toHaveValue('1200000');
  await expect(
    page.getByText('Giá trị: 1.200.000 ₫', { exact: true }),
  ).toBeVisible();
  await amount.click();
  await expect(amount).toHaveValue('1200000');
  // Refocusing through replacement/paste must replace, never append the old value.
  await title.click();
  await amount.fill('7000');
  await expect(amount).toHaveValue('7000');
  await amount.press('ControlOrMeta+A');
  await amount.pressSequentially('50000');
  await title.fill('Khoản chi gõ từng số');
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto('/accounts');
  await expect(
    page.getByRole('button', { name: 'Sửa ví Ví test số tiền', exact: true }),
  ).toContainText('950.000 ₫');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Sửa ví Ví test số tiền', exact: true }),
  ).toContainText('950.000 ₫');
  await page.goto('/transactions');
  await expect(
    page.getByText('Khoản chi gõ từng số', { exact: true }),
  ).toBeVisible();
});

test('empty/zero/negative/decimal/unsafe inputs still cannot create a transaction', async ({
  page,
}) => {
  await openForm(page);
  await page
    .getByRole('textbox', { name: 'Tên giao dịch', exact: true })
    .fill('Không được ghi');
  const amount = page.getByRole('textbox', { name: 'SỐ TIỀN', exact: true });
  for (const value of [
    '',
    '0',
    '-1',
    '1.5',
    '1,5',
    '50,000',
    '50000 ₫',
    '9007199254740992',
  ]) {
    await amount.fill(value);
    await page
      .getByRole('button', { name: 'Lưu giao dịch', exact: true })
      .click();
    await expect(
      page.getByText(
        'Nhập số tiền nguyên, lớn hơn 0 và trong giới hạn an toàn.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/add(?:[?#]|$)/);
  }
  await page.goto('/accounts');
  await expect(
    page.getByRole('button', { name: 'Sửa ví Ví test số tiền', exact: true }),
  ).toContainText('1.000.000 ₫');
  await page.goto('/transactions');
  await expect(page.getByText('Không được ghi', { exact: true })).toHaveCount(
    0,
  );
});
