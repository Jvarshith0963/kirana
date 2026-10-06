-- Up Migration
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,       -- e.g. 'order_placed', 'order_delivered', 'payment_success'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Down Migration
DROP TABLE IF EXISTS notifications;