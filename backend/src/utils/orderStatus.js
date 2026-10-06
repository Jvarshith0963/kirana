// Defines which status transitions are legal.
// Each key can only move to the statuses listed in its array.
const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [], // terminal state
  cancelled: [], // terminal state
};

function isValidTransition(currentStatus, newStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

module.exports = { ALLOWED_TRANSITIONS, isValidTransition };