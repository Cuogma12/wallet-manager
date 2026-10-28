# Financial setup smoke checklist

Automated: `npm test` exercises the repository with real SQLite. Run `npx tsc --noEmit`, `npx expo lint`, and `npx expo export --platform ios` as build checks. Native screen/keyboard/navigation behavior still needs the checks below on an iPhone.

## Kiểm tra trên iPhone (Expo Go)

- [ ] Bản cài mới: tab Ví trống, có nút Thêm ví; màn Thêm giao dịch/Ghi nhận lương hướng dẫn tạo ví, không lưu vào ID mẫu `cash`.
- [ ] Tạo ví Tiền mặt số dư `1.000.000`, ví Ngân hàng `2.000.000`: tổng tài sản `3.000.000`, không có giao dịch thu giả.
- [ ] Nhập số dư `0` được phép; tên trống, số thập phân `1,5`, `1.5`, số vượt giới hạn báo lỗi và không lưu.
- [ ] Chi `50.000` từ Tiền mặt: số dư `950.000`. Sửa tên/loại/số dư thành `900.000`: khoản chi vẫn còn, không có khoản thu mới.
- [ ] Ô số tiền giao dịch: gõ từng phím `50000` giữ nguyên `50000` cả khi đổi focus; dòng xem trước hiện `Giá trị: 50.000 ₫`. Lưu tạo đúng một khoản chi 50.000, không báo lỗi do dấu phân cách. Thay toàn bộ số bằng nhập/dán không nối thêm giá trị cũ.
- [ ] Chèn/xóa ở giữa số, Backspace qua mốc 1.000 và xóa hết không tự chèn dấu hay đổi số tiền. Dán `1.200.000`, rời ô rồi sửa tiếp không tạo nhóm sai. Số `0`, âm, thập phân, văn bản kèm đơn vị hoặc vượt giới hạn vẫn bị từ chối, không thay đổi số dư.
- [ ] Thêm giao dịch mặc định ngày hôm nay theo lịch địa phương; nút Hôm nay/Hôm qua cập nhật đúng qua ranh giới tháng/năm. Có thể nhập DD/MM/YYYY hoặc mở lịch, đổi tháng và chạm ngày để chọn; đóng lịch không sửa ngày đã chọn.
- [ ] Lịch bắt đầu từ thứ Hai, hiển thị đúng 29/02 năm nhuận; ngày không tồn tại/trống bị từ chối, không ghi giao dịch hay đổi số dư. Trên màn hình 320px, vuốt lịch ngang để chọn cột cuối; mỗi ngày vẫn có vùng chạm tối thiểu 44pt.
- [ ] Chi/thu ghi lùi ngày xuất hiện đúng tháng trong Tổng quan và Giao dịch, không tự chuyển về hôm nay khi lưu/reload/offline. Tổng tài sản vẫn là số dư hiện tại, không phải số dư lịch sử tại ngày chọn.
- [ ] Ngày hôm nay dùng thời điểm lưu thực tế; ngày khác dùng 12:00 giờ địa phương để chuyển thành ISO lưu trong `occurred_at`. Không thêm cột/migration. Thu/chi thường giữ nguyên quy tắc hiện tại (không chặn ngày tương lai); lương vẫn chặn ngày nhận tương lai.
- [ ] Ghi lương `18.000.000` vào Ngân hàng: tạo một giao dịch thu, số dư `20.000.000`. Bấm lưu nhanh nhiều lần không tạo trùng.
- [ ] Quay lại cùng tháng hoặc đổi ví nhận: báo đã ghi nhận, không cộng lần hai. Chọn tháng khác thì lưu được.
- [ ] Khi nhập số dư có sẵn lương, bật “Lương đã nằm trong số dư ví”: thêm giao dịch thu nhưng số dư không tăng thêm.
- [ ] Ngày `31/02/2026`, ngày tương lai hoặc ví không tồn tại: báo lỗi, không đổi tiền. Tháng lương có thể khác tháng nhận thực tế.
- [ ] Thu nhập khác từ màn Thêm giao dịch vẫn lưu được nhiều lần trong tháng, không bị coi là lương.
- [ ] Bản nâng cấp v1/v2: lịch sử và số dư cũ còn nguyên, ví/giao dịch mẫu được nhận diện; ghi giao dịch mới thành công.
- [ ] Bỏ demo → Hủy: mọi dữ liệu không đổi. Xác nhận: chỉ ẩn giao dịch mẫu; ví tự tạo và giao dịch tự nhập không mất.
- [ ] Ví mẫu có khoản chi tự nhập được giữ (có thể âm sau khi bỏ số dư mẫu). Nhập lại số dư thật. Ví mẫu đã sửa số dư không bị đổi số dư khi bỏ demo.
- [ ] Đóng/mở app và ngắt Internet: ví/lương/giao dịch vẫn còn và tiếp tục lưu được khi bundle đã tải. Chưa có đồng bộ online.
- [ ] Bàn phím không che nút lưu; có thể cuộn form. Lưu đang chạy thì không bấm lưu/back lặp lại. Không cần nhập thêm tổng số dư riêng.
- [ ] Xác nhận các màn này hiển thị tiếng Việt, nút có vùng chạm >=44pt và thông báo lỗi đọc được.

## Reset toàn bộ dữ liệu

- [ ] Tab Ví → Xóa toàn bộ dữ liệu → Hủy: không thay đổi ví, số dư, giao dịch hay lương.
- [ ] Xác nhận xóa: không còn ví/giao dịch/lương/dữ liệu mẫu; có thể tạo ví mới. Không tự reset khi reload.
- [ ] Đóng/mở app sau reset: vẫn trống, không seed demo trở lại. Không ảnh hưởng tài khoản ngân hàng thật.
- [ ] Khi DB lỗi giữa chừng: rollback cả reset, báo lỗi, không xóa một phần.

## Chưa thuộc phạm vi

Chuyển tiền giữa ví, ngân sách thật, import sao kê và kết nối ngân hàng vẫn là công việc tiếp theo. Tổng quan theo tháng và chi tiết/sửa/xóa giao dịch thủ công đã có checklist riêng tại [monthly-transactions.md](./monthly-transactions.md).
