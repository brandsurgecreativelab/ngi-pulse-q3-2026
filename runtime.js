/* Pulse runtime: a small renderer for the Pulse page template.
   Supports {{holes}}, <sc-for list as>, <sc-if value>, on* events, ref callbacks,
   and a component class with state, setState and lifecycle hooks. */
(function () {
  'use strict';
  var EVENTS = { onclick: 'click', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave', onfocus: 'focus', onblur: 'blur' };
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

  function lookup(path, scope) {
    var parts = path.split('.');
    var v;
    for (var s = scope; s; s = s.parent) {
      if (s.vars && Object.prototype.hasOwnProperty.call(s.vars, parts[0])) { v = s.vars[parts[0]]; break; }
    }
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function single(str) { var m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str); return m ? m[1] : null; }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null ? '' : String(v); });
  }

  // Every template node gets a stable id. A virtual node's key is that id plus its position in any
  // enclosing <sc-for>, so an <sc-if> opening or closing never shifts its siblings onto other content.
  var uid = 0;
  function keyOf(node, scope) {
    if (!node.__pk) node.__pk = ++uid;
    return node.__pk + '@' + (scope.path || '');
  }

  // Template node -> virtual nodes
  function build(node, scope, out) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (t.indexOf('{{') >= 0) t = interp(t, scope);
      out.push({ text: t, key: keyOf(node, scope) });
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = lookup(single(node.getAttribute('list')), scope) || [];
      var as = node.getAttribute('as') || 'item';
      var fid = keyOf(node, scope);
      for (var i = 0; i < list.length; i++) {
        var vars = {}; vars[as] = list[i];
        var sub = { vars: vars, parent: scope, path: fid + ':' + i };
        for (var c = node.firstChild; c; c = c.nextSibling) build(c, sub, out);
      }
      return;
    }
    if (tag === 'sc-if') {
      if (lookup(single(node.getAttribute('value')), scope)) for (var d = node.firstChild; d; d = d.nextSibling) build(d, scope, out);
      return;
    }
    var v = { tag: tag, ns: node.namespaceURI, attrs: {}, on: {}, ref: null, children: [], key: keyOf(node, scope) };
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, val = at.value, low = name.toLowerCase();
      if (low.indexOf('hint-') === 0) continue;
      if (EVENTS[low]) { var h = single(val); v.on[EVENTS[low]] = h ? lookup(h, scope) : null; continue; }
      if (low === 'ref') { var r = single(val); v.ref = r ? lookup(r, scope) : null; continue; }
      v.attrs[name] = val.indexOf('{{') >= 0 ? interp(val, scope) : val;
    }
    for (var k = node.firstChild; k; k = k.nextSibling) build(k, scope, v.children);
    out.push(v);
  }

  // Virtual nodes -> DOM
  function create(v) {
    if (v.text !== undefined) { v.el = document.createTextNode(v.text); return v.el; }
    var el = v.ns && v.ns !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(v.ns, v.tag) : document.createElement(v.tag);
    v.el = el; el.__a = {}; el.__h = {};
    setAttrs(el, {}, v.attrs);
    setEvents(el, v.on);
    for (var i = 0; i < v.children.length; i++) el.appendChild(create(v.children[i]));
    if (typeof v.ref === 'function') v.ref(el);
    el.__ref = v.ref;
    return el;
  }
  function setAttrs(el, oldA, newA) {
    var n;
    for (n in oldA) if (!(n in newA)) { el.removeAttribute(n); delete el.__a[n]; }
    for (n in newA) {
      if (el.__a[n] === newA[n]) continue;
      el.__a[n] = newA[n];
      try { el.setAttribute(n, newA[n]); } catch (e) { /* invalid attribute name */ }
      if (n === 'value' && 'value' in el) el.value = newA[n];
    }
  }
  function setEvents(el, on) {
    var t;
    for (t in el.__h) if (!on[t]) el.__h[t] = null;
    for (t in on) {
      if (!(t in el.__h) || el.__l === undefined || !el.__l[t]) {
        el.__l = el.__l || {};
        if (!el.__l[t]) {
          el.__l[t] = (function (type) { return function (e) { var f = el.__h[type]; if (typeof f === 'function') f(e); }; })(t);
          el.addEventListener(t, el.__l[t]);
        }
      }
      el.__h[t] = on[t];
    }
  }
  function destroy(v) {
    if (v.text !== undefined) return;
    for (var i = 0; i < v.children.length; i++) destroy(v.children[i]);
    if (typeof v.el.__ref === 'function') v.el.__ref(null);
  }
  // Updates a kept node in place. Only called for an old and new node with the same key, tag and namespace.
  function patch(oldV, newV) {
    var el = newV.el = oldV.el;
    if (newV.text !== undefined) {
      if (el.nodeValue !== newV.text) el.nodeValue = newV.text;
      return;
    }
    setAttrs(el, oldV.attrs, newV.attrs);
    setEvents(el, newV.on);
    if (newV.ref !== el.__ref) {
      if (typeof el.__ref === 'function') el.__ref(null);
      el.__ref = newV.ref;
      if (typeof newV.ref === 'function') newV.ref(el);
    }
    patchChildren(el, oldV.children, newV.children);
  }
  function same(o, n) {
    if (!o || o.key !== n.key) return false;
    if (n.text !== undefined) return o.text !== undefined;
    return o.text === undefined && o.tag === n.tag && o.ns === n.ns;
  }
  function patchChildren(el, oldC, newC) {
    var detached = false;
    for (var i = 0; i < oldC.length; i++) if (oldC[i].el.parentNode !== el) { detached = true; break; }
    if (detached) {
      // Something outside the renderer replaced these children (for example a number count-up): rebuild them.
      for (var j = 0; j < oldC.length; j++) destroy(oldC[j]);
      while (el.firstChild) el.removeChild(el.firstChild);
      for (var k = 0; k < newC.length; k++) el.appendChild(create(newC[k]));
      return;
    }
    // Match by key, so content that stays keeps its DOM node (and the observers and animations attached to it).
    var byKey = {}, used = {};
    for (var a = 0; a < oldC.length; a++) byKey[oldC[a].key] = oldC[a];
    var match = new Array(newC.length);
    for (var b = 0; b < newC.length; b++) {
      var o = byKey[newC[b].key];
      if (same(o, newC[b]) && !used[o.key]) { match[b] = o; used[o.key] = true; }
    }
    // Release what is leaving first, so a ref handed from an old node to a new one ends on the new node.
    for (var r = 0; r < oldC.length; r++) if (!used[oldC[r].key]) { destroy(oldC[r]); el.removeChild(oldC[r].el); }
    var cursor = el.firstChild;
    for (var x = 0; x < newC.length; x++) {
      var node;
      if (match[x]) { patch(match[x], newC[x]); node = newC[x].el; }
      else node = create(newC[x]);
      if (node !== cursor) el.insertBefore(node, cursor); else cursor = cursor.nextSibling;
    }
  }

  function DCLogic(props) { this.props = props || {}; }
  DCLogic.prototype.setState = function (part) {
    this.state = Object.assign({}, this.state || {}, typeof part === 'function' ? part(this.state || {}) : part);
    if (this.__mount) this.__mount.schedule();
  };
  window.DCLogic = DCLogic;

  window.PulseRuntime = {
    mount: function (Component, template, root, props) {
      var inst = new Component(props);
      inst.props = props;
      var vtree = null, queued = false, mounted = false;
      function render() {
        queued = false;
        var vals = inst.renderVals ? inst.renderVals() : {};
        var out = [];
        for (var c = template.firstChild; c; c = c.nextSibling) build(c, { vars: vals, parent: null }, out);
        var wrap = { tag: 'div', ns: null, attrs: {}, on: {}, ref: null, children: out };
        if (!vtree) { root.appendChild(create(wrap)); vtree = wrap; }
        else { wrap.el = vtree.el; patchChildren(vtree.el, vtree.children, out); vtree = wrap; }
        if (!mounted) { mounted = true; if (inst.componentDidMount) inst.componentDidMount(); }
        else if (inst.componentDidUpdate) inst.componentDidUpdate();
      }
      inst.__mount = { schedule: function () { if (!queued) { queued = true; Promise.resolve().then(render); } } };
      render();
      window.addEventListener('pagehide', function () { if (inst.componentWillUnmount) inst.componentWillUnmount(); });
      return inst;
    }
  };
})();
