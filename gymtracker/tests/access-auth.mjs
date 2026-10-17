// Run with Node 22+ type stripping: node --experimental-strip-types tests/access-auth.mjs
import {hasAccessAuth} from '../src/access-auth.ts';
import assert from 'node:assert/strict';
const env={ACCESS_ISSUER:'https://orbyt-video.cloudflareaccess.com',ACCESS_AUDIENCE:'test'};
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='qa';
globalThis.fetch=async()=>Response.json({keys:[jwk]});
const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
async function signedRequest(claims={},overrideHeader={}) {
  const h=b64({alg:'RS256',kid:'qa',...overrideHeader});
  const p=b64({iss:env.ACCESS_ISSUER,aud:['test'],exp:Date.now()/1000+60,...claims});
  const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(h+'.'+p));
  return new Request('https://gymtracker.jackhannon.net/api/admin/stats',{headers:{'Cf-Access-Jwt-Assertion':h+'.'+p+'.'+Buffer.from(signature).toString('base64url')}});
}
assert.equal(await hasAccessAuth(await signedRequest(),env),true);
for(const claims of [{exp:1},{aud:['other']},{iss:'https://attacker.example'},{nbf:Date.now()/1000+60}]) assert.equal(await hasAccessAuth(await signedRequest(claims),env),false);
assert.equal(await hasAccessAuth(await signedRequest({},{alg:'none'}),env),false);
assert.equal(await hasAccessAuth(new Request('https://gymtracker.jackhannon.net/api/admin/stats',{headers:{'Cf-Access-Authenticated-User-Email':'fake@example.com'}}),env),false);
console.log('PASS: valid signed JWT accepted; invalid JWT claims/signature format and forged email denied');
