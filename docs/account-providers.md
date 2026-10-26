# Danh mục ngân hàng và ví điện tử offline

## Phạm vi

- 20 ngân hàng, 5 ví điện tử; đây là danh mục chọn tên/logo, **không phải liên kết ngân hàng**.
- Vào Ví → Thêm ví → chọn Ngân hàng hoặc Ví điện tử → chọn nhà cung cấp. Hoặc mở “Chọn ngân hàng / ví điện tử” từ màn Ví.
- Chọn nhà cung cấp điền tên mặc định nếu chưa có tên riêng. Tên tự nhập luôn được giữ khi đổi nhà cung cấp. Có thể chọn “Khác / nhập tên riêng”. Không tự tạo số dư, lương, giao dịch hoặc tài khoản mẫu.
- Logo hiện trong danh mục, form, danh sách ví và bộ chọn ví ở form giao dịch/lương. Danh mục và ảnh được bundle/cached trong bản PWA production, không gọi API runtime.
- `src/shared/constants/accountProviders.ts`: dữ liệu thuần, ID ổn định. `src/shared/components/atoms/icons/institutionLogos.ts`: ánh xạ asset. `InstitutionIcon.tsx`: render chung, fallback icon theo loại ví nếu không biết ID.
- SQLite v4 thêm `accounts.provider_id TEXT NULL`. Backup v1 giữ `providerId` tùy chọn và tương thích file cũ; xem [SCHEMA](./database/SCHEMA.md).

## Nguồn tài nguyên

Snapshot tải ngày 2026-10-26. Tên/logo được dùng để nhận diện thương hiệu, không hàm ý quan hệ đối tác hay quyền truy cập API. Nhãn hiệu thuộc các chủ sở hữu; không coi tài nguyên công khai là giấy phép chuyển nhượng hay quyền sở hữu logo. Cần kiểm tra điều kiện sử dụng thương hiệu trước khi phát hành rộng rãi.

- Danh sách/mã/logo: [API Banks của VietQR](https://www.vietqr.io/api-bank), endpoint công khai `https://api.vietqr.io/v2/banks`.
- Ảnh giữ nguyên, lưu tại `src/shared/components/atoms/icons/assets/institutions/`. Không dùng ảnh AI hay tự vẽ lại logo.

| ID / file trong repo | URL ảnh gốc                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| mbbank.png           | https://cdn.vietqr.io/img/MB.png                                             |
| vietcombank.png      | https://cdn.vietqr.io/img/VCB.png                                            |
| vietinbank.png       | https://cdn.vietqr.io/img/ICB.png                                            |
| bidv.png             | https://cdn.vietqr.io/img/BIDV.png                                           |
| agribank.png         | https://cdn.vietqr.io/img/VBA.png                                            |
| techcombank.png      | https://cdn.vietqr.io/img/TCB.png                                            |
| acb.png              | https://cdn.vietqr.io/img/ACB.png                                            |
| vpbank.png           | https://cdn.vietqr.io/img/VPB.png                                            |
| tpbank.png           | https://cdn.vietqr.io/img/TPB.png                                            |
| sacombank.png        | https://cdn.vietqr.io/img/SACOMBANK.png                                      |
| hdbank.png           | https://cdn.vietqr.io/img/HDB.png                                            |
| vib.png              | https://cdn.vietqr.io/img/VIB.png                                            |
| shb.png              | https://cdn.vietqr.io/img/SHB.png                                            |
| msb.png              | https://cdn.vietqr.io/img/MSB.png                                            |
| ocb.png              | https://cdn.vietqr.io/img/OCB.png                                            |
| eximbank.png         | https://cdn.vietqr.io/img/EIB.png                                            |
| lpbank.png           | https://cdn.vietqr.io/img/LPBANK.png                                         |
| seabank.png          | https://cdn.vietqr.io/img/SEAB.png                                           |
| shinhan.png          | https://cdn.vietqr.io/img/SHBVN.png                                          |
| cake.png             | https://cdn.vietqr.io/img/CAKE.png                                           |
| momo.png             | https://cdn.vietqr.io/img/momo.png                                           |
| zalopay.png          | https://cdn.vietqr.io/img/ZALOPAY.png                                        |
| viettelmoney.png     | https://cdn.vietqr.io/img/VTLMONEY.png                                       |
| vnptmoney.png        | https://cdn.vietqr.io/img/VNPTMONEY.png                                      |
| shopeepay.png        | https://shopeepay.vn/wallet_icon.jpg (favicon chính thức; nội dung thực là PNG) |

Khi cập nhật: kiểm tra nguồn thực, giữ ID cũ, cập nhật dữ liệu/ảnh/ánh xạ và bảng nguồn; không đổi tên ID chỉ vì ngân hàng đổi thương hiệu. Chạy test, build PWA và kiểm tra ảnh offline trước khi deploy. Danh mục là tập con chọn sẵn, không cam kết đầy đủ mọi ngân hàng hay luôn phản ánh trạng thái cung cấp dịch vụ.

## Checklist kiểm thử

- [ ] Ví cũ nâng từ v3 vẫn giữ số dư/lịch sử và dùng icon chung; có thể gắn nhà cung cấp bằng sửa ví.
- [ ] Tìm tên có/không dấu, viết hoa, mã `TCB`, `VCB`, `MB`, `AirPay`.
- [ ] Chọn ngân hàng điền tên mặc định; đổi tên riêng rồi đổi nhà cung cấp không ghi đè tên.
- [ ] Đổi loại ngân hàng → ví điện tử → tiền mặt không giữ logo sai loại.
- [ ] Chọn Khác, nhập tên/số dư rồi lưu; được tạo nhiều ví cùng ngân hàng.
- [ ] Tắt mạng sau khi PWA sẵn sàng: mở danh mục, xem logo, tạo/sửa ví, reload vẫn giữ lựa chọn.
- [ ] Export/restore giữ nhà cung cấp; file backup cũ thiếu trường vẫn nhập được.
- [ ] Chọn ví ở form chi tiêu/lương hiện đúng logo và số dư không bị thay đổi chỉ vì chọn logo.
- [ ] Không hiển thị giả “đã kết nối”, số tài khoản, phần trăm đồng bộ hay phiên hết hạn.

Tự động: `npm test` kiểm tra danh mục/asset, tìm kiếm, validation, migration rollback và backup; `npm run test:pwa` kiểm tra luồng offline trên Chromium và WebKit. Vẫn cần smoke test trên iPhone thật trước khi dùng chính thức.
