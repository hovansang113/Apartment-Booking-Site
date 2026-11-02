-- A conditional state prevents concurrent checkout requests from charging the
-- same reservation twice. Failed payments can still transition back into
-- processing for a valid retry before the reservation hold expires.
ALTER TABLE `payments`
  MODIFY `status` ENUM('pending', 'processing', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending';
