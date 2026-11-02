const app = require('./app');
const { validateEnv } = require('./config/env');
const { expireStalePaymentHolds } = require('./services/booking.service');

validateEnv();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server dang chay tai http://localhost:${PORT}`);
});

// Dọn lượt giữ chỗ quá hạn lúc khởi động và mỗi phút. unref() để timer không
// giữ tiến trình sống khi server đang được dừng.
function cleanExpiredHolds() {
  expireStalePaymentHolds()
    .then((count) => {
      if (count > 0) console.log(`Released ${count} expired reservation hold(s)`);
    })
    .catch((err) => console.error('Could not release expired reservation holds:', err.message));
}

cleanExpiredHolds();
setInterval(cleanExpiredHolds, 60 * 1000).unref();
