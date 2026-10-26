const { test, expect } = require('@playwright/test');

test.use({ isMobile: true, hasTouch: true });

async function checkFocusedField(page, field, value) {
  await field.click();
  await field.fill(value);
  await expect(field).toBeFocused();
  const layout = await field.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const parent = element.parentElement.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      parentRight: parent.right,
      width: window.innerWidth,
      fontSize: parseFloat(getComputedStyle(element).fontSize),
      pageWidth: document.documentElement.scrollWidth,
    };
  });
  expect(layout.fontSize).toBeGreaterThanOrEqual(16);
  expect(layout.left).toBeGreaterThanOrEqual(-1);
  expect(layout.right).toBeLessThanOrEqual(layout.width + 1);
  expect(layout.right).toBeLessThanOrEqual(layout.parentRight + 1);
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.width + 1);
}

for (const width of [320, 390]) {
  test(`focused inputs stay within a ${width}px screen with long text and large amounts`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/manage-account');
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Tên ví', exact: true }),
      'X'.repeat(80),
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Số dư hiện tại (₫)', exact: true }),
      '-9007199254740991',
    );
    await page
      .getByRole('textbox', { name: 'Tên ví', exact: true })
      .fill('Ví kiểm tra');
    await page
      .getByRole('textbox', { name: 'Số dư hiện tại (₫)', exact: true })
      .fill('100000');
    await page.getByRole('button', { name: 'Lưu ví', exact: true }).click();
    await expect(page).not.toHaveURL(/\/manage-account(?:[?#]|$)/);
    await page.goto('/salary');
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Lương thực nhận (₫)', exact: true }),
      '9007199254740991',
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Ngày nhận lương', exact: true }),
      '01/01/2026',
    );
    await page.goto('/connect-accounts');
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Tìm ngân hàng / ví', exact: true }),
      'ngan hang'.repeat(10),
    );
    await page.goto('/add');
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'SỐ TIỀN', exact: true }),
      '9007199254740991',
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Tên giao dịch', exact: true }),
      'GiaoDichKhongCoKhoangTrang'.repeat(8),
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Ghi chú', exact: true }),
      'NoiDungRatDai'.repeat(30),
    );
    // A shortened viewport exercises scroll/focus layout, not a real iOS keyboard.
    await page.setViewportSize({ width, height: 380 });
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Tên giao dịch', exact: true }),
      'Kiểm tra input',
    );
    await page
      .getByRole('textbox', { name: 'SỐ TIỀN', exact: true })
      .fill('1000');
    await page
      .getByRole('button', { name: 'Lưu giao dịch', exact: true })
      .click();
    await expect(page).not.toHaveURL(/\/add(?:[?#]|$)/);
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/transactions');
    const search = page.getByRole('textbox');
    await checkFocusedField(
      page,
      search,
      'TimKiemKhongCoKhoangTrang'.repeat(10),
    );
    await search.fill('Kiểm tra input');
    await page.getByText('Kiểm tra input', { exact: true }).click();
    await page
      .getByRole('button', { name: 'Sửa giao dịch', exact: true })
      .click();
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Tên giao dịch', exact: true }),
      'GiaoDichKhongCoKhoangTrang'.repeat(8),
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Số tiền (₫)', exact: true }),
      '9007199254740991',
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Ngày giao dịch', exact: true }),
      '01/01/2026',
    );
    await checkFocusedField(
      page,
      page.getByRole('textbox', { name: 'Ghi chú', exact: true }),
      'NoiDungRatDai'.repeat(30),
    );
    await page.screenshot({
      path: test.info().outputPath('focused-input.png'),
      fullPage: true,
    });
  });
}
