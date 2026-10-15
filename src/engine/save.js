/* 存档与全局进度（localStorage，前缀 lw_）
 * 所有权：engine。在 file:// 下若 localStorage 不可用，自动降级为内存存储，保证不报错。
 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});
  var PREFIX = 'lw_';
  var SLOTS = 6;

  var mem = {};
  var hasLS = (function () {
    try {
      var k = PREFIX + '__t';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function rawGet(k) {
    if (hasLS) { try { return window.localStorage.getItem(k); } catch (e) { /* fallthrough */ } }
    return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
  }
  function rawSet(k, v) {
    if (hasLS) { try { window.localStorage.setItem(k, v); return true; } catch (e) { /* fallthrough */ } }
    mem[k] = v;
    return true;
  }
  function rawDel(k) {
    if (hasLS) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
    delete mem[k];
  }
  function read(k, dflt) {
    var s = rawGet(k);
    if (s === null || s === undefined || s === '') return dflt;
    try { return JSON.parse(s); } catch (e) { return dflt; }
  }
  function write(k, v) {
    try { rawSet(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }

  var KEY_GLOBAL = PREFIX + 'global';
  var KEY_AUTO = PREFIX + 'auto';

  VN.save = {
    PREFIX: PREFIX,
    SLOTS: SLOTS,
    available: hasLS,

    global: function () { return read(KEY_GLOBAL, null); },
    putGlobal: function (g) { return write(KEY_GLOBAL, g); },

    slotKey: function (n) { return PREFIX + 'slot_' + n; },
    writeSlot: function (n, obj) { return write(this.slotKey(n), obj); },
    readSlot: function (n) { return read(this.slotKey(n), null); },
    listSlots: function () {
      var out = [];
      for (var i = 1; i <= SLOTS; i++) out.push({ slot: i, data: this.readSlot(i) });
      return out;
    },
    writeAuto: function (obj) { return write(KEY_AUTO, obj); },
    readAuto: function () { return read(KEY_AUTO, null); },
    delSlot: function (n) { rawDel(this.slotKey(n)); },

    wipe: function () {
      var keys = [];
      try {
        for (var i = 0; i < window.localStorage.length; i++) {
          var k = window.localStorage.key(i);
          if (k && k.indexOf(PREFIX) === 0) keys.push(k);
        }
      } catch (e) { /* ignore */ }
      keys.forEach(rawDel);
      Object.keys(mem).forEach(function (k) { if (k.indexOf(PREFIX) === 0) delete mem[k]; });
    }
  };

  /* SPEC §6 承诺的是 VN.save(slot) / VN.load(slot) / VN.slots()，
     而历史上 VN.save 被做成了一个普通对象（writeSlot / readSlot / listSlots …），
     VN.load 与 VN.slots 根本不存在 —— 契约与实现不一致（R2-E04）。

     这里把 VN.save 改成「可调用的对象」：直接调用即把当前进度存进该槽，
     同时把上面那个对象上的全部方法与常量原样搬过来，
     所以 VN.save.writeSlot(...) 等既有调用点一个都不用改。 */
  var saveApi = VN.save;
  var saveFn = function (slot) {
    var n = slot | 0;
    if (n <= 0 || typeof VN.snapshot !== 'function') return false;
    return !!saveApi.writeSlot(n, VN.snapshot());
  };
  Object.keys(saveApi).forEach(function (k) { saveFn[k] = saveApi[k]; });
  VN.save = saveFn;

  /* VN.load(slot)：读回该槽；有数据就交给引擎的 VN.doLoad(obj) 真正载入。 */
  VN.load = function (slot) {
    var data = VN.save.readSlot(slot | 0);
    if (!data || typeof VN.doLoad !== 'function') return false;
    return !!VN.doLoad(data);
  };

  /* VN.slots()：列出全部槽位（含空槽，data 为 null）。 */
  VN.slots = function () { return VN.save.listSlots(); };
})();
