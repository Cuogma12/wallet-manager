# Coding Rules — Bản tiếng Việt

`CODING_RULES.md` là bản chuẩn để agent, tool và contributor quốc tế đọc. File này là bản tóm tắt tiếng Việt cho team hiện tại; nếu có khác biệt, `CODING_RULES.md` được ưu tiên.

## Checklist trước khi code

- [ ] Đọc hết `CODING_RULES.md` và file này.
- [ ] Đọc `AGENTS.md` và kiểm tra cấu trúc code liên quan.
- [ ] Xác định thay đổi thuộc route, feature, shared UI, hook, service hay database.
- [ ] Nếu là màn hình mới/sửa màn hình, đặt trong `src/features/<screen-name>/`; route chỉ re-export hoặc cấu hình navigation.
- [ ] Tái sử dụng component, hook, icon, constant, utility và token có sẵn trước khi tạo mới.
- [ ] Kiểm tra version Expo trước khi dùng API Expo/React Native.

## Quy tắc chính

- Component chỉ render giao diện và nhận data/callback qua props.
- Logic, side effect, fetch data và form behavior đặt trong hook.
- Mỗi màn hình có module riêng: `screens/`, `components/`, `hooks/`, `services/`, `types/` khi cần.
- File route trong `src/app/` chỉ là adapter của Expo Router hoặc layout/navigation, không chứa business logic.
- Component/hook chỉ dùng cho một màn hình giữ trong feature đó; chỉ đưa vào `src/shared/` khi dùng lại từ hai feature trở lên.
- Feature không được import ngược từ `src/app/`.
- Database đặt trong `src/db/`; tích hợp ngân hàng/ví đặt trong `src/services/`.
- Code dùng chung đặt trong `src/shared/`.
- Atomic Design: `atoms`, `molecules`, `organisms`.
- Icon chỉ đặt và dùng qua `src/shared/components/atoms/icons/`.
- React/web dùng Tailwind; React Native dùng NativeWind sau khi repo được cấu hình.
- Tạo hoặc mở rộng common styles/token trước khi viết custom CSS hoặc `StyleSheet` dài.
- Không hardcode màu, spacing, radius, typography khi đã có token.
- Tất cả text hiển thị cho user phải đi qua `useI18n()`.
- Database lưu key ổn định như `food`, `salary`, `shopping`, không lưu text đã dịch.
- Không lưu mật khẩu ngân hàng, OTP hoặc token nhạy cảm trong app database.
- Rule nghiệp vụ mới phải có unit test hoặc manual test scenario rõ ràng.
- Luôn xử lý loading, empty, error, offline, syncing, conflict và retry state.
- Control tương tác phải có accessibility label khi cần và touch target tối thiểu 44pt.
- Không log password, OTP, access token, toàn bộ số tài khoản hoặc payload nhạy cảm.
- DTO từ API phải được map sang domain type trước khi truyền vào UI.
- Sync phải idempotent và chống giao dịch import trùng bằng provider identifier.
- Dependency mới phải có lý do rõ ràng và tương thích Expo.

## Checklist sau khi code

- [ ] `npx tsc --noEmit`
- [ ] `npx expo lint`
- [ ] `npx expo-doctor` nếu đổi dependency/config/native module.
- [ ] Test flow bị ảnh hưởng hoặc chạy bundle/export phù hợp.
- [ ] Đã kiểm tra loading, empty, error, offline và review state nếu có.
- [ ] Route chỉ map tới feature screen; logic màn hình không nằm trực tiếp trong `src/app/`.
- [ ] Đã có test hoặc manual test scenario cho business rule mới.
- [ ] Đã kiểm tra accessibility và touch target.
- [ ] Không log hoặc commit dữ liệu nhạy cảm.
- [ ] Dependency/API mới đã được review.
- [ ] Không có secret hoặc thông tin ngân hàng nhạy cảm trong commit.
- [ ] Cập nhật documentation nếu thay đổi architecture.
