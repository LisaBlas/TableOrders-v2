export function getTableStatus(tableId, orders, seatedTables = new Set()) {
  const order = orders[tableId];
  const hasOrders = order && order.length > 0;

  if (hasOrders) {
    const hasOrdered = order.some((item) => (item.sentQty || 0) > 0);
    if (hasOrdered) return "ordered";
    return "taken";
  }

  // No orders - check if table is seated
  if (seatedTables.has(tableId)) return "taken";

  return "open";
}

// Expand items so qty > 1 becomes N individual lines for per-item splitting
export function expandItems(items) {
  const expanded = [];
  let uniqueCounter = 0;
  items.forEach((item, itemIndex) => {
    for (let i = 0; i < item.qty; i++) {
      expanded.push({ ...item, _uid: `${item.id}_${itemIndex}_${i}_${uniqueCounter++}`, qty: 1 });
    }
  });
  return expanded;
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).catch(() => {});
}

export function formatTicketText(tableId, items) {
  const consolidated = consolidateItems(items);
  const total = consolidated.reduce((s, o) => s + o.price * o.qty, 0);
  return `TICKET — Table ${tableId}\n${"─".repeat(28)}\n${consolidated
    .map((o) => `${o.qty}x ${o.name.padEnd(22)} ${(o.price * o.qty).toFixed(2)}€`)
    .join("\n")}\n${"─".repeat(28)}\nTOTAL  ${total.toFixed(2)}€`;
}

export function formatOrderText(tableId, items) {
  // Group by destination
  const byDestination = { bar: [], counter: [], kitchen: [] };
  items.forEach((item) => {
    const unsentQty = item.qty - (item.sentQty || 0);
    if (unsentQty > 0) {
      const destination = getItemDestination(item);
      byDestination[destination].push({ ...item, qty: unsentQty });
    }
  });

  const sections = [];

  if (byDestination.bar.length > 0) {
    sections.push(
      "🍷 BAR (Waiter):\n" +
      byDestination.bar.map((o) => `  ${o.qty}x ${o.name}`).join("\n")
    );
  }

  if (byDestination.counter.length > 0) {
    sections.push(
      "🧀 COUNTER (Cheese):\n" +
      byDestination.counter.map((o) => `  ${o.qty}x ${o.name}`).join("\n")
    );
  }

  if (byDestination.kitchen.length > 0) {
    sections.push(
      "🍽️ KITCHEN (Hot/Salad):\n" +
      byDestination.kitchen.map((o) => `  ${o.qty}x ${o.name}`).join("\n")
    );
  }

  return `ORDER — Table ${tableId}\n${new Date().toLocaleTimeString()}\n\n${sections.join("\n\n")}`;
}

// Consolidate items with same ID by summing their quantities
export function consolidateItems(items) {
  const consolidated = new Map();

  items.forEach((item) => {
    if (consolidated.has(item.id)) {
      const existing = consolidated.get(item.id);
      existing.qty += item.qty;
    } else {
      consolidated.set(item.id, { ...item });
    }
  });

  return Array.from(consolidated.values());
}

// Determine destination for an item (Bar, Counter, Kitchen)
export function getItemDestination(item) {
  // Bar: All drinks, wines, bottles, schnaps, juices, water
  if (
    item.id.startsWith("wg") || // Wines by glass
    item.id.startsWith("dr") || // Drinks/beer/cocktails
    item.id.startsWith("te") || // Teas
    item.id.startsWith("co") || // Coffee
    item.id.endsWith("_bottle") || // All bottles
    item.category === "Bottles 🍾" || // Bottles category
    item.category === "Drinks🍷" || // Drinks category
    // Schnaps items
    ["cognac", "calvados", "mirabelle", "jameson", "creme_calvados"].includes(item.id.split("-")[0]) ||
    // Juices and water items
    item.id.includes("saft") || item.id.includes("schorle") || item.id.includes("wasser")
  ) {
    return "bar";
  }

  // Counter: Cheese & Charcuterie
  if (item.subcategory === "cheese") {
    return "counter";
  }

  // Kitchen: Warm, Salads, Snacks
  return "kitchen";
}
