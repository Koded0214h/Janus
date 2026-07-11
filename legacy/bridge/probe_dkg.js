const sdk = require('@ika.xyz/sdk');

console.log('prepareDKG:', sdk.prepareDKG?.toString().slice(0, 300));
console.log('prepareDKGAsync:', sdk.prepareDKGAsync?.toString().slice(0, 300));
console.log('\nUserShareEncryptionKeys prototype:',
  Object.getOwnPropertyNames(sdk.UserShareEncryptionKeys?.prototype || {})
);
console.log('\nAll exports:', Object.keys(sdk));