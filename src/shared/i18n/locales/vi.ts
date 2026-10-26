export const vi = {
  common: {
    automatic: 'Tự động',
    cancel: 'Hủy',
    loading: 'Đang tải',
    offlineFirst: 'Offline-first',
    details: 'Chi tiết',
    seeAll: 'Xem tất cả',
    seeReport: 'Xem báo cáo',
    manage: 'Quản lý',
    vnd: '₫',
    back: 'Quay lại',
    saving: 'Đang lưu...',
    retry: 'Thử lại',
    loadFailed: 'Không đọc được dữ liệu trên máy. Hãy thử lại.',
  },
  nav: {
    overview: 'Tổng quan',
    transactions: 'Giao dịch',
    budgets: 'Ngân sách',
    accounts: 'Ví',
  },
  pwa: {
    title: 'Cài Monee trên iPhone',
    noScript:
      'Bật JavaScript để mở Monee. Dữ liệu tài chính chỉ được lưu trên thiết bị này.',
    installHelp:
      'Mở link HTTPS bằng Safari → Chia sẻ → Thêm vào màn hình chính → Mở dưới dạng ứng dụng. Chờ trạng thái “Sẵn sàng offline” trước khi tắt mạng. Lần đầu và lúc cập nhật cần có mạng.',
    storageUnavailable: 'Chưa mở được bộ nhớ bền vững của trình duyệt.',
    storageHelp:
      'Dùng Safari mới, không dùng chế độ riêng tư và kiểm tra dung lượng máy. Website phải dùng HTTPS và trình duyệt phải cho phép IndexedDB. Không có dữ liệu nào được tự động xóa hoặc chuyển sang lưu tạm. Khi chạy local, dùng npm run build:web rồi npm run preview:web.',
    keepStorage: 'Yêu cầu giữ dữ liệu trên máy',
    persisted:
      'Trình duyệt đã cấp lưu trữ bền vững. Bạn vẫn cần sao lưu; xóa dữ liệu website hoặc gỡ app có thể làm mất dữ liệu.',
    notPersisted:
      'Chưa được cấp lưu trữ bền vững. Trình duyệt có thể dọn dữ liệu khi thiếu dung lượng. Hãy sao lưu thường xuyên.',
    update: 'Cập nhật và tải lại',
    updateHint:
      'Có bản mới. Lưu công việc và xuất bản sao lưu trước khi tải lại; app không tự reload khi bạn đang nhập liệu.',
    status: {
      native: 'Bản app cài trực tiếp',
      development:
        'Chế độ lập trình: chưa cài bộ nhớ offline. Dùng bản web đã build để kiểm tra PWA.',
      installing:
        'Đang lưu các tệp của app để dùng offline. Giữ kết nối mạng đến khi hoàn tất.',
      ready:
        'Sẵn sàng offline — dữ liệu tiền bạc lưu riêng trên thiết bị, chưa đồng bộ online.',
      unavailable:
        'Trình duyệt hoặc kết nối hiện tại chưa hỗ trợ cài offline. Hãy mở link HTTPS trong Safari.',
      error:
        'Chưa lưu đủ tệp để chạy offline. Giữ mạng và mở lại app để thử lại; dữ liệu tài chính không bị xóa.',
    },
  },
  backup: {
    title: 'Sao lưu & cài ứng dụng',
    export: 'Xuất bản sao lưu',
    import: 'Chọn tệp khôi phục',
    warning:
      'Bản sao lưu JSON không mã hóa, có tên ví, số dư và lịch sử thu–chi. Chỉ lưu ở nơi riêng tư. Không gửi tệp cho người lạ. Dữ liệu Expo Go và PWA không tự chuyển; hãy xuất từ app cũ rồi nhập vào app mới.',
    exportNotice:
      'Đã mở thao tác lưu/chia sẻ tệp. Hãy kiểm tra bản sao đã nằm trong Tệp/iCloud hoặc thư mục tải về; hủy hộp thoại thì chưa có bản sao ngoài app.',
    confirmTitle: 'Thay dữ liệu hiện tại bằng bản sao này?',
    summary:
      'Bản sao ngày {{date}}: {{accounts}} ví, {{transactions}} giao dịch.',
    replaceWarning:
      'Toàn bộ ví, giao dịch và thiết lập tiền của hồ sơ trên thiết bị này sẽ bị thay thế. Không thể hoàn tác trong app. Hãy xuất bản sao dữ liệu hiện tại trước khi tiếp tục. Không ảnh hưởng ngân hàng hoặc hồ sơ khác.',
    acknowledge:
      'Tôi đã giữ bản sao cần thiết và hiểu dữ liệu hiện tại sẽ bị thay thế.',
    confirmReplace: 'Xác nhận thay thế dữ liệu',
    restored:
      'Đã khôi phục dữ liệu. Các ví và báo cáo đã được cập nhật từ bản sao.',
  },
  overview: {
    currentBalanceHint:
      'Số dư hiện tại của tất cả ví, không phải số dư cuối tháng đã chọn.',
    currentMonth: 'Về tháng hiện tại',
    net: 'Chênh lệch thu – chi',
    cashFlowHint:
      'Theo ngày giao dịch thực tế trong tháng đã chọn. Không tính chuyển tiền giữa các ví; tháng lương không thay thế ngày nhận.',
    chartHint:
      'Tối đa 7 ngày đến hôm nay trong tháng hiện tại; với tháng khác là các ngày cuối tháng.',
    chartDay: '{{date}}: chi {{amount}}',
    noSpending: 'Chưa có khoản chi trong khoảng ngày này.',
    emptyTitle: 'Tháng này chưa có giao dịch',
    emptyText: 'Thêm giao dịch mới hoặc chuyển sang tháng khác để xem.',
    dateLabel: 'THỨ TƯ, 7 THÁNG 10',
    greeting: 'Chào {{name}} 👋',
    month: 'Tháng 10, 2026',
    totalBalance: 'TỔNG SỐ DƯ',
    allAccounts: 'Tất cả tài khoản',
    income: 'Thu nhập',
    spent: 'Đã chi',
    monthlyBudget: 'Ngân sách tháng',
    used: 'Đã sử dụng',
    remaining: 'Còn lại {{amount}}',
    weeklySpending: 'Chi tiêu 7 ngày',
    recentTransactions: 'Giao dịch gần đây',
    addTransaction: 'Thêm giao dịch',
    budgetUsed: '{{spent}} / {{budget}}',
  },
  transactions: {
    eyebrow: 'DÒNG TIỀN',
    title: 'Giao dịch',
    filter: 'Bộ lọc giao dịch',
    searchPlaceholder: 'Tìm giao dịch...',
    all: 'Tất cả',
    expenses: 'Chi tiêu',
    income: 'Thu nhập',
    resultCount: '{{count}} giao dịch trong {{month}}',
    emptyTitle: 'Chưa có giao dịch phù hợp',
    emptyText: 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.',
  },
  budgets: {
    eyebrow: 'THÁNG 10, 2026',
    title: 'Ngân sách',
    add: 'Thêm ngân sách',
    totalSpent: 'TỔNG ĐÃ CHI',
    withinBudget: 'trong ngân sách 12.000.000 ₫',
    used: 'đã dùng',
    insightTitle: 'Một gợi ý nhỏ',
    insightText: 'Bạn đang chi cho mua sắm hơi nhanh hơn kế hoạch tháng này.',
    category: 'Danh mục',
  },
  transactionDetail: {
    title: 'Chi tiết giao dịch',
    edit: 'Sửa giao dịch',
    save: 'Lưu thay đổi',
    delete: 'Xóa giao dịch',
    deleteTitle: 'Xóa giao dịch này?',
    deleteHint:
      'Giao dịch sẽ bị ẩn khỏi lịch sử và báo cáo. Số dư ví được điều chỉnh ngược lại khoản thu/chi này. Không có nút hoàn tác trong app.',
    confirmDelete: 'Xác nhận xóa',
    balanceHint:
      'Sửa số tiền, loại thu/chi hoặc ví sẽ điều chỉnh số dư tương ứng. Với lương đã nằm trong số dư lúc nhập, chỉ chênh lệch được cộng/trừ khi sửa; xóa sẽ trừ khoản lương đã ghi.',
    amount: 'Số tiền (₫)',
    date: 'Ngày giao dịch',
    salaryMonthHint:
      'Nhập YYYY-MM, ví dụ 2026-10. Tháng lương độc lập với ngày nhận; mỗi tháng chỉ có một khoản lương.',
    readOnly:
      'Giao dịch nhập từ bên ngoài hoặc chuyển tiền hiện chỉ được xem; chưa hỗ trợ sửa/xóa để tránh lệch dữ liệu.',
    accountValue: 'Ví: {{name}}',
    categoryValue: 'Danh mục: {{name}}',
    salaryValue: 'Lương của {{month}}',
    types: { expense: 'Chi tiêu', income: 'Thu nhập', transfer: 'Chuyển tiền' },
    sources: {
      manual: 'Nhập thủ công',
      imported: 'Nhập từ sao kê',
      'bank-api': 'Đồng bộ ngân hàng',
    },
  },
  accounts: {
    eyebrow: 'TÀI SẢN CỦA BẠN',
    title: 'Ví & tài khoản',
    settings: 'Cài đặt tài khoản',
    totalAssets: 'TỔNG TÀI SẢN',
    manualData: 'Dữ liệu cập nhật thủ công',
    sourceCount: '{{count}} tài khoản',
    connectTitle: 'Liên kết tài khoản',
    connectText: 'Đồng bộ giao dịch chỉ-đọc từ ngân hàng hoặc ví.',
    connect: 'Liên kết tài khoản',
    importStatement: 'Import sao kê',
    comingSoon: 'Sắp có',
    settingsComingSoon: 'Tính năng cài đặt tài khoản sẽ được bổ sung sau.',
    openBankingComingSoon:
      'Backend Open Banking sẽ được tích hợp ở bước tiếp theo.',
    importComingSoon:
      'Tính năng import CSV/Excel sẽ được bổ sung ở bước tiếp theo.',
    addWallet: 'Thêm ví',
    editWallet: 'Sửa ví {{name}}',
    recordSalary: 'Ghi nhận lương',
    emptyTitle: 'Bắt đầu với ví đầu tiên',
    emptyText:
      'Nhập số tiền hiện có trong từng ví. Tổng tài sản sẽ tự cộng từ các ví này.',
    demoBadge: 'Mẫu',
    demoTitle: 'Bạn đang có dữ liệu mẫu',
    demoDescription:
      'Bỏ dữ liệu mẫu trước khi thiết lập tiền của bạn. Giao dịch tự nhập luôn được giữ lại.',
    clearDemo: 'Bỏ dữ liệu mẫu',
    clearDemoTitle: 'Bỏ dữ liệu mẫu?',
    clearDemoConfirm:
      'Chỉ giao dịch mẫu và ví mẫu chưa sử dụng sẽ được ẩn. Ví mẫu có giao dịch tự nhập được giữ, nhưng số dư mẫu bị bỏ; số dư có thể âm. Ví đã sửa số dư và ví tự tạo không bị mất.',
    clearDemoDone: 'Đã bỏ dữ liệu mẫu',
    clearDemoDoneText:
      'Giao dịch của bạn vẫn còn. Hãy kiểm tra và nhập số dư hiện tại cho các ví được giữ lại.',
    balanceHint: 'Chạm vào một ví để sửa tên, loại ví hoặc số dư hiện tại.',
    resetAll: 'Xóa toàn bộ dữ liệu',
    resetTitle: 'Xóa hết dữ liệu trên máy này?',
    resetWarning: 'Xóa cả ví, lương và giao dịch đã nhập',
    resetDescription:
      'Chỉ dùng khi muốn bắt đầu lại từ đầu. Không thể hoàn tác trong app.',
    resetConfirm:
      'Tất cả ví, giao dịch, lương và dữ liệu mẫu của hồ sơ hiện tại trên máy này sẽ bị xóa vĩnh viễn; số dư và thiết lập tiền về 0. Không thể hoàn tác nếu chưa có bản sao lưu. Thao tác không xóa tài khoản hay giao dịch tại ngân hàng/ví điện tử.',
    resetDone: 'Đã xóa dữ liệu trên máy',
    resetDoneText:
      'Bạn có thể tạo ví mới và nhập số dư hiện tại để bắt đầu lại.',
  },
  manageAccount: {
    createTitle: 'Tạo ví',
    editTitle: 'Sửa ví',
    name: 'Tên ví',
    namePlaceholder: 'Ví dụ: Tiền mặt, ngân hàng của tôi',
    type: 'Loại ví',
    balance: 'Số dư hiện tại (₫)',
    balancePlaceholder: 'Ví dụ: 1.200.000',
    balanceHint:
      'Nhập số tiền hiện có. Đây là số dư gốc, không phải giao dịch thu. Có thể nhập số âm nếu ví đang nợ.',
    editHint:
      'Sửa số dư không xóa lịch sử giao dịch và không làm tăng thu nhập.',
    save: 'Lưu ví',
  },
  salary: {
    title: 'Ghi nhận lương',
    month: 'Lương của tháng',
    previousMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    amount: 'Lương thực nhận (₫)',
    amountPlaceholder: 'Ví dụ: 18.000.000',
    receivedDate: 'Ngày nhận lương',
    datePlaceholder: 'DD/MM/YYYY',
    dateHint:
      'Ngày nhận thực tế có thể khác tháng lương. Không nhập ngày tương lai.',
    account: 'Ví nhận lương',
    transactionTitle: 'Lương {{month}}',
    alreadyRecorded:
      'Đã ghi nhận lương tháng này. Không thể cộng thêm lần nữa.',
    included: 'Lương đã nằm trong số dư ví',
    includedHint:
      'Bật nếu số dư bạn vừa nhập đã bao gồm lương này. App ghi giao dịch thu nhưng không cộng tiền thêm.',
    save: 'Lưu lương',
    noAccount: 'Tạo một ví trước để chọn nơi nhận lương.',
  },
  financeErrors: {
    invalidAmount: 'Nhập số tiền nguyên, lớn hơn 0 và trong giới hạn an toàn.',
    invalidBalance: 'Số dư phải là số tiền nguyên trong giới hạn an toàn.',
    nameRequired: 'Nhập tên ví trước nhé.',
    titleRequired: 'Nhập tên giao dịch trước nhé.',
    accountRequired: 'Chọn một ví trước nhé.',
    accountNotFound: 'Ví này không còn tồn tại. Hãy chọn hoặc tạo ví khác.',
    invalidMonth: 'Tháng lương không hợp lệ.',
    invalidDate: 'Nhập ngày có thật theo định dạng DD/MM/YYYY.',
    futureDate: 'Chỉ ghi nhận lương đã nhận, không chọn ngày tương lai.',
    salaryExists: 'Tháng này đã có giao dịch lương. Không cộng thêm lần nữa.',
    unsupportedTransfer: 'Chuyển tiền giữa các ví chưa được hỗ trợ.',
    saveFailed: 'Không lưu được dữ liệu. Hãy thử lại.',
    transactionNotFound: 'Giao dịch không tồn tại hoặc đã bị xóa.',
    readOnlyTransaction:
      'Giao dịch nhập từ bên ngoài hiện chỉ được xem để tránh lệch dữ liệu đồng bộ.',
    invalidCategory: 'Danh mục không phù hợp với loại giao dịch.',
    invalidBackup:
      'Bản sao lưu không hợp lệ, không tương thích hoặc số dư không khớp. Dữ liệu hiện tại chưa bị thay đổi.',
    backupTooLarge: 'Chỉ nhận bản sao lưu nhỏ hơn 10 MB.',
    restoreUnavailable:
      'Không thể khôi phục khi hồ sơ đang đồng bộ hoặc ID trùng hồ sơ khác. Dữ liệu hiện tại vẫn được giữ nguyên.',
    backupFileFailed:
      'Không đọc/ghi được tệp. Hãy thử lại hoặc chọn trình duyệt thông thường thay vì chế độ riêng tư.',
    webStorageConflict:
      'Dữ liệu đã thay đổi ở tab khác. Khoản vừa nhập chưa được lưu. Hãy tải lại app trước khi tiếp tục để tránh ghi đè.',
  },
  accountConnections: {
    title: 'Kết Nối Tài Khoản',
    back: 'Quay lại',
    secureLabel: 'MÃ HÓA CHUẨN NGÂN HÀNG 256-BIT',
    support: 'Hỗ trợ kết nối',
    securityTitle: 'Quyền truy cập CHỈ ĐỌC (Read-Only)',
    safeBadge: '100% An toàn',
    securityDescription:
      'Monee chỉ đọc lịch sử biến động số dư và giao dịch để tự động phân loại chi tiêu thông minh.',
    noTransfer: 'KHÔNG THỂ thực hiện chuyển tiền hoặc thanh toán',
    noPassword: 'KHÔNG BAO GIỜ yêu cầu mật khẩu đăng nhập ngân hàng',
    noOtp: 'KHÔNG lưu trữ mã OTP hay thông tin bảo mật nhạy cảm',
    systemStatus: 'Trạng thái hệ thống',
    realtime: 'Thời gian thực',
    syncing: 'Đang đồng bộ',
    syncDetail: 'Đang đồng bộ 30 ngày giao dịch gần nhất...',
    syncProgress: '{{progress}}%',
    sessionExpiredTitle: 'MBBank Cần Cấp Lại Quyền',
    sessionExpiredDescription:
      'Phiên kết nối hết hạn bao gồm các giao dịch gần nhất (90 ngày). Vui lòng xác thực lại để tiếp tục đồng bộ dữ liệu.',
    paused: 'Tạm ngắt',
    skip: 'Bỏ qua',
    retryNow: 'Thử lại ngay',
    banksTitle: 'Ngân hàng đối tác',
    bankCount: '6 ngân hàng sẵn sàng',
    autoCategorize: 'Tự động gắn thẻ chi tiêu',
    walletsTitle: 'Ví điện tử',
    walletCount: 'Tự động gắn thẻ chi tiêu',
    active: 'Đang hoạt động',
    manage: 'Quản lý',
    connect: 'Kết nối',
    connectedPhone: '090••••123',
    withdrawTitle: 'Chủ động thu hồi quyền bất kỳ lúc nào',
    withdrawDescription:
      'Bạn có thể ngắt kết nối ngân hàng ngay trong Monee hoặc trực tiếp tại ứng dụng ngân hàng của bạn.',
    searchBanks: 'Tìm kiếm ngân hàng khác (30+ đối tác)',
    manualEntry: 'Nhập thủ công không cần kết nối',
    helpTitle: 'Hỗ trợ kết nối',
    helpDescription: 'Monee sẽ hướng dẫn bạn kết nối an toàn.',
    connectedAlertTitle: 'Đã chọn kết nối',
    connectedAlertDescription:
      'Luồng kết nối {{provider}} sẽ được tích hợp ở bước tiếp theo.',
    retryAlertDescription: 'Đang chuẩn bị xác thực lại kết nối MBBank.',
    searchAlertDescription: 'Danh sách ngân hàng mở rộng sẽ được cập nhật sớm.',
    providers: {
      vietcombank: {
        name: 'Vietcombank Digital',
        detail: 'Tài khoản chính ••9824',
      },
      mbbank: {
        name: 'MBBank Quân Đội',
        detail: 'Đang hoạt động • Số dư tự động',
      },
      techcombank: {
        name: 'Techcombank',
        detail: 'Hỗ trợ API Open Banking',
      },
      acb: {
        name: 'ACB Á Châu',
        detail: 'ACB ONE FastConnect',
      },
      vpbank: {
        name: 'VPBank NEO',
        detail: 'Chưa kết nối',
      },
      tpbank: {
        name: 'TPBank LiveBank',
        detail: 'Chưa kết nối',
      },
      momo: {
        name: 'Ví MoMo',
      },
      zalopay: {
        name: 'ZaloPay',
        detail: 'Đồng bộ qua mã QR an toàn',
      },
      shopeepay: {
        name: 'ShopeePay',
        detail: 'Tự động lưu đơn hàng mua sắm',
      },
    },
  },
  add: {
    title: 'Thêm giao dịch',
    close: 'Đóng',
    expense: 'Chi tiêu',
    income: 'Thu nhập',
    amount: 'SỐ TIỀN',
    amountPlaceholder: '0',
    transactionName: 'Tên giao dịch',
    expensePlaceholder: 'Ví dụ: Ăn trưa',
    incomePlaceholder: 'Ví dụ: Tiền thưởng',
    salaryHint:
      'Để ghi lương theo tháng và tránh cộng trùng, dùng luồng Ghi nhận lương.',
    category: 'Danh mục',
    account: 'Tài khoản',
    note: 'Ghi chú',
    optional: '(không bắt buộc)',
    notePlaceholder: 'Thêm ghi chú...',
    save: 'Lưu giao dịch',
    amountRequired: 'Nhập số tiền trước nhé.',
    titleRequired: 'Nhập tên giao dịch trước nhé.',
    noAccount:
      'Bạn chưa có ví. Tạo ví và nhập số dư trước khi ghi giao dịch nhé.',
  },
  categories: {
    food: 'Ăn uống',
    transport: 'Di chuyển',
    shopping: 'Mua sắm',
    bills: 'Hóa đơn',
    entertainment: 'Giải trí',
    other: 'Khác',
    salary: 'Lương',
  },
  accountTypes: {
    cash: 'Tiền mặt',
    bank: 'Ngân hàng',
    wallet: 'Ví điện tử',
  },
  accountStatus: {
    local: 'Chỉ lưu trên máy',
    connected: 'Đã kết nối',
    needsReview: 'Cần kiểm tra đồng bộ',
  },
  days: {
    monday: 'T2',
    tuesday: 'T3',
    wednesday: 'T4',
    thursday: 'T5',
    friday: 'T6',
    saturday: 'T7',
    sunday: 'CN',
  },
} as const;
