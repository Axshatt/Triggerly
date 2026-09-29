// ============================================
// STORE — Puter KV Storage for app data
// ============================================

// Save trigger data
export async function saveTrigger(trigger) {
  const triggers = await getTriggers();
  trigger.id = trigger.id || 'trig_' + Date.now();
  trigger.createdAt = trigger.createdAt || new Date().toISOString();
  triggers.push(trigger);
  await puter.kv.set('triggerly_triggers', JSON.stringify(triggers));
  return trigger;
}

export async function getTriggers() {
  try {
    const data = await puter.kv.get('triggerly_triggers');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function deleteTrigger(id) {
  const triggers = await getTriggers();
  const filtered = triggers.filter(t => t.id !== id);
  await puter.kv.set('triggerly_triggers', JSON.stringify(filtered));
}

export async function updateTrigger(id, updates) {
  const triggers = await getTriggers();
  const idx = triggers.findIndex(t => t.id === id);
  if (idx !== -1) {
    triggers[idx] = { ...triggers[idx], ...updates };
    await puter.kv.set('triggerly_triggers', JSON.stringify(triggers));
    return triggers[idx];
  }
  return null;
}

// Save results/outputs
export async function saveResult(result) {
  const results = await getResults();
  result.id = result.id || 'res_' + Date.now();
  result.createdAt = result.createdAt || new Date().toISOString();
  results.unshift(result); // newest first
  // Keep only last 50
  if (results.length > 50) results.length = 50;
  await puter.kv.set('triggerly_results', JSON.stringify(results));
  return result;
}

export async function getResults() {
  try {
    const data = await puter.kv.get('triggerly_results');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save SuperProfile products
export async function saveProducts(products) {
  await puter.kv.set('triggerly_products', JSON.stringify(products));
}

export async function getProducts() {
  try {
    const data = await puter.kv.get('triggerly_products');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Analytics/events
export async function trackEvent(eventName, data = {}) {
  try {
    const events = await getEvents();
    events.push({
      event: eventName,
      data,
      timestamp: new Date().toISOString()
    });
    // Keep last 200 events
    if (events.length > 200) events.splice(0, events.length - 200);
    await puter.kv.set('triggerly_events', JSON.stringify(events));
  } catch (e) {
    console.log('Track event failed:', e);
  }
}

export async function getEvents() {
  try {
    const data = await puter.kv.get('triggerly_events');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
