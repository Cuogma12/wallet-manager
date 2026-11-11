const { test, expect } = require('@playwright/test');

async function createWallet(page, name, balance) {
  await page.goto('/manage-account');
  await page.getByLabel('Tên ví', { exact: true }).fill(name);
  await page
    .getByLabel('Số dư hiện tại (₫)', { exact: true })
    .fill(String(balance));
  await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
  await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
}

test('amount-only quick entry, recent template and pasted notification work offline without duplicates', async ({
  page,
}) => {
  await createWallet(page, 'MBBank cá nhân', 1000000);
  await page.goto('/add');
  const saveButton = page.getByRole('button', {
    name: 'Lưu giao dịch',
    exact: true,
  });
  await expect(saveButton).toBeDisabled();
  await page.getByLabel('SỐ TIỀN', { exact: true }).fill('50000');
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto('/transactions');
  await expect(page.getByText('Ăn uống', { exact: true })).toBeVisible();

  await page.goto('/add');
  await page
    .getByRole('button', {
      name: 'Dùng lại Ăn uống, 50.000 ₫',
      exact: true,
    })
    .click();
  await expect(page.getByLabel('SỐ TIỀN', { exact: true })).toHaveValue(
    '50000',
  );

  const date = await page.evaluate(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}/${now.getFullYear()}`;
  });
  const notification = `MBBank | GD: -70.000 VND lúc 09:15 ${date} | SD: 880.000 VND | ND: GRABFOOD`;
  await page.getByRole('tab', { name: 'Dán biến động', exact: true }).click();
  await page
    .getByLabel('Nội dung thông báo biến động', { exact: true })
    .fill(notification);
  await page
    .getByRole('button', { name: 'Phân tích biến động', exact: true })
    .click();
  await expect(
    page.getByText('Đã đọc xong. Hãy kiểm tra các thông tin trước khi lưu.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel('SỐ TIỀN', { exact: true })).toHaveValue(
    '70000',
  );
  await expect(page.getByLabel('Tên giao dịch', { exact: true })).toHaveValue(
    'GRABFOOD',
  );
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);

  await page.goto('/add');
  await page.getByRole('tab', { name: 'Dán biến động', exact: true }).click();
  await page
    .getByLabel('Nội dung thông báo biến động', { exact: true })
    .fill(notification);
  await page
    .getByRole('button', { name: 'Phân tích biến động', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Biến động này đã được nhập trước đó',
  );
  await page.goto('/accounts');
  await expect(
    page.getByRole('button', { name: 'Sửa ví MBBank cá nhân', exact: true }),
  ).toContainText('880.000 ₫');
});

test('a Vietnamese sentence fills and saves a categorized transaction', async ({
  page,
}) => {
  await createWallet(page, 'Ví ăn uống', 500000);
  await page.goto('/add');
  await page
    .getByLabel('Nhập bằng một câu', { exact: true })
    .fill('ăn tối hôm qua 40k');
  await expect(
    page.getByText('Đã tự điền. Kiểm tra bên dưới rồi lưu nhé.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel('SỐ TIỀN', { exact: true })).toHaveValue(
    '40000',
  );
  await expect(page.getByText('Ăn tối', { exact: true })).toBeVisible();
  await expect(page.getByText(/Ăn uống · Ví ăn uống ·/)).toBeVisible();
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto('/transactions');
  await expect(page.getByText('Ăn tối', { exact: true })).toBeVisible();
  await expect(page.getByText('-40.000 ₫', { exact: true })).toBeVisible();
});

test('quick entry learns a corrected category for a similar phrase', async ({
  page,
}) => {
  await createWallet(page, 'Ví cá nhân', 1000000);
  await page.goto('/add');
  await page
    .getByLabel('Nhập bằng một câu', { exact: true })
    .fill('đi nhậu 250k');
  await page
    .getByRole('button', { name: 'Chỉnh chi tiết', exact: true })
    .click();
  await page.getByRole('button', { name: 'Ăn uống', exact: true }).click();
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);

  await page.goto('/add');
  await page
    .getByLabel('Nhập bằng một câu', { exact: true })
    .fill('nhậu với bạn 400k');
  await expect(
    page.getByText(
      'Đã tự điền theo giao dịch trước của bạn. Kiểm tra rồi lưu nhé.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText(/Ăn uống · Ví cá nhân ·/)).toBeVisible();
});

test('a named custom budget category is reusable when recording expenses', async ({
  page,
}) => {
  await createWallet(page, 'Ví thú cưng', 500000);
  const calendar = await page.evaluate(() => {
    const now = new Date();
    return {
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}`,
    };
  });
  await page.goto(`/budgets?month=${calendar.month}`);
  await page
    .getByRole('button', { name: 'Thêm ngân sách', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Tạo hạng mục riêng', exact: true })
    .click();
  await page.getByLabel('Tên hạng mục mới', { exact: true }).fill('Thú cưng');
  await page.getByLabel('Hạn mức (₫)', { exact: true }).fill('200000');
  await page
    .getByRole('button', { name: 'Lưu ngân sách', exact: true })
    .click();
  await expect(page.getByText('Thú cưng', { exact: true })).toBeVisible();

  await page.goto('/add');
  await page.getByLabel('SỐ TIỀN', { exact: true }).fill('50000');
  await page
    .getByRole('button', { name: 'Chỉnh chi tiết', exact: true })
    .click();
  await page.getByRole('button', { name: 'Thú cưng', exact: true }).click();
  await page
    .getByRole('button', { name: 'Lưu giao dịch', exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
  await page.goto(`/budgets?month=${calendar.month}`);
  await expect(
    page.getByText('Đã chi 50.000 ₫ / hạn mức 200.000 ₫', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Đã dùng 25%', { exact: true })).toBeVisible();
});
