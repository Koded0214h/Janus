// Run: node probe_sdk.js
// Shows every callable function in the Ika SDK so we can build the bridge correctly.

const sdk = require('@ika.xyz/sdk');

function inspect(label, obj) {
  if (!obj) { console.log(`\n=== ${label} === UNDEFINED`); return; }
  const type = typeof obj;
  if (type === 'function') {
    // It's a class or function — check its static methods and prototype
    console.log(`\n=== ${label} (function/class) ===`);
    console.log('Static keys:   ', Object.keys(obj));
    console.log('Prototype keys:', Object.getOwnPropertyNames(obj.prototype || {}));
    return;
  }
  if (type === 'object') {
    console.log(`\n=== ${label} (object) ===`);
    const keys = Object.keys(obj);
    keys.forEach(k => {
      const v = obj[k];
      console.log(`  ${k}: ${typeof v}${typeof v === 'function' ? ' ✓' : ''}`);
    });
    return;
  }
  console.log(`\n=== ${label} === ${type}: ${obj}`);
}

// Top-level
console.log('\n======= TOP-LEVEL EXPORTS =======');
console.log(Object.keys(sdk));

// The ones most likely to hold dWallet creation
inspect('coordinatorTransactions', sdk.coordinatorTransactions);
inspect('systemTransactions',      sdk.systemTransactions);
inspect('IkaClient (class)',        sdk.IkaClient);
inspect('IkaTransaction',          sdk.IkaTransaction);
inspect('CoordinatorModule',       sdk.CoordinatorModule);
inspect('CoordinatorInnerModule',  sdk.CoordinatorInnerModule);
inspect('SystemModule',            sdk.SystemModule);
inspect('SessionsManagerModule',   sdk.SessionsManagerModule);

// Try instantiating IkaClient and checking instance methods
console.log('\n=== IkaClient instance methods ===');
try {
  const { getNetworkConfig } = sdk;
  const cfg = getNetworkConfig('testnet');
  const client = new sdk.IkaClient({ ikaConfig: cfg });
  console.log('Instance keys:', Object.keys(client));
  console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client))
    .filter(k => k !== 'constructor'));
} catch(e) {
  console.log('Could not instantiate IkaClient:', e.message);
}

// Dump all top-level functions (likely the DKG helpers)
console.log('\n=== Top-level functions (standalone) ===');
Object.keys(sdk).forEach(k => {
  if (typeof sdk[k] === 'function') console.log(' ', k);
});