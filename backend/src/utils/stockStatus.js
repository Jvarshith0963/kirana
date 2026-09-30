const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stockQuantity) {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "available";
}

module.exports = { getStockStatus, LOW_STOCK_THRESHOLD };