import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { Client, WebsocketReceiver } from '../lib/index.js';
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const frame = (socket, s, d, sn) => socket.emit('message', Buffer.from(JSON.stringify({s, d, sn})));
const makeClient = socketFactory => new Client({token:'fixture', mode:'websocket', autoReconnect:false, handleProcessErrors:false, socketFactory, logLevel:'off'});
test('stop cancels pending discovery and pending hello without creating a late socket', async () => {
 let complete; let calls=0;
 const client=makeClient(()=>{calls++;});
 client.request.get=()=>new Promise(resolve=>{complete=resolve;});
 const pending=client.connect(); const rejected=assert.rejects(pending,/cancelled/);
 await client.disconnect(); complete({data:{url:'wss://gateway.invalid/'}}); await rejected;
 assert.equal(calls,0); assert.equal(client.receiver.timers.size,0);
 const socket=Object.assign(new EventEmitter(),{readyState:0, terminate(){this.terminated=true;}});
 const second=makeClient(()=>socket); second.request.get=async()=>({data:{url:'wss://gateway.invalid/'}});
 const hello=second.connect(); const cancelled=assert.rejects(hello,/cancelled/);
 await flush(); await second.disconnect(); await cancelled;
 assert.equal(socket.terminated,true); assert.equal(second.receiver.cancelHello,null);
});
test('resume preserves contiguous ordering and holds replay until ACK; rejection resets session', async () => {
 const sockets=[]; const urls=[]; let discoveries=0;
 const client=makeClient(url=>{
  urls.push(new URL(url)); const socket=Object.assign(new EventEmitter(),{readyState:1,send(){},terminate(){}}); sockets.push(socket);
  queueMicrotask(()=>frame(socket,1,{code:0,session_id:'session-a'})); return socket;
 });
 client.request.get=async()=>{discoveries++;return {data:{url:'wss://gateway.invalid/?ticket=x'}};}; client.init=async()=>{};
 const receiver=client.receiver; receiver.removeAllListeners('event'); const delivered=[]; receiver.on('event',d=>delivered.push(d.id));
 try {
  await client.connect(); frame(sockets[0],0,{id:2},2); frame(sockets[0],0,{id:1},1); frame(sockets[0],0,{id:1},1);
  assert.deepEqual(delivered,[1,2]); sockets[0].emit('close',1006,Buffer.from('cut'));
  const resumed=receiver.connect(true); await flush();
  assert.equal(urls[1].searchParams.get('sn'),'2'); assert.equal(discoveries,1);
  frame(sockets[1],0,{id:4},4); frame(sockets[1],0,{id:3},3); assert.deepEqual(delivered,[1,2]);
  frame(sockets[1],6,{session_id:'session-a'}); await resumed; assert.deepEqual(delivered,[1,2,3,4]);
  assert.equal(receiver.state,WebsocketReceiver.State.Open);
  frame(sockets[1],5,{code:40108}); assert.equal(receiver.canResume(),false); assert.equal(receiver.sn,0);
  await client.connect(); assert.equal(discoveries,2); assert.equal(urls[2].searchParams.has('resume'),false);
  const waiting=receiver.connect(true); const cancelled=assert.rejects(waiting,/cancelled/); await flush(); await client.disconnect(); await cancelled;
  assert.equal(receiver.cancelResume,null); assert.deepEqual(receiver.resumeEvents,[]);
 } finally {await client.disconnect();}
});
test('embedding client leaves process exception handlers unchanged', async()=>{
 const before=process.listeners('uncaughtException'); const client=makeClient(()=>{});
 assert.deepEqual(process.listeners('uncaughtException'),before); await client.disconnect();
});
