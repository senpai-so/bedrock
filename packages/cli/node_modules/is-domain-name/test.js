'use strict'

const test = require('tape')
const puny = require('punycode')
const is = require('.')

test('invalid urls', function (assert) {
  assert.notOk(is(''), 'empty domain')
  assert.notOk(is('   ', 'whitespace domain'))
  assert.notOk(is('.d'), 'too short TLD')
  assert.notOk(is('.com', 'empty label'))
  assert.notOk(is('this-is-a-long-label-which-is-exactly-064-chars-long-and-invalid.com'), 'too long label')
  assert.notOk(is('some-very-very-very-very.looooooooooooooooooooooong-domain-name.thats-invalid-as-its-longer-than-256-chars.thats-also-very-very-very-nested-in-a-lot-of-subsubsubdomains.another-long-subdomain.gee-this-it-department-should-really-learn-some-ux.oh-noes-not-another-one.example.com'), 'too long domain name')
  assert.notOk(is('a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.eu'), 'too many labels')

  assert.notOk(is('-a.com'), 'label starts with dash')
  assert.notOk(is('a-.com'), 'label ends with dash')
  assert.notOk(is('-a-.com'), 'label surrounded with dashes')

  assert.notOk(is('.-a'), 'TLD starts with dash')
  assert.notOk(is('.a-'), 'TLD ends with dash')
  assert.notOk(is('.-a-'), 'TLD surrounded with dashes')

  assert.notOk(is('_yapper._gmail.google.com'), 'invalid chars')
  assert.notOk(is('æøå.xyz'), 'should be puny coded')

  assert.notOk(is('example.com.', false), 'root dot not allowed')
  assert.notOk(is('example.com', true), 'root dot missing')

  assert.end()
})

test('valid urls', function (assert) {
  assert.ok(is('localhost'), 'single label')
  assert.ok(is('example.com'), 'simple domain')
  assert.ok(is('example.technology'), 'long TLD')
  assert.ok(is('this-is-a-long-label-which-is-exactly-63-chars-long-and-invalid.com'), 'longest possible label')
  assert.ok(is('some-very-very-very-very-long-domain-name.thats-valid-as-its-shorter-than-256-chars.thats-also-very-very-very-nested-in-a-lot-of-subsubsubdomains.another-long-subdomain.gee-this-it-department-should-really-learn-some-ux.oh-noes-not-another-one.example.com'), 'longest possible domain name')
  assert.ok(is('a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.eu'), 'label limit')

  assert.ok(is('some-example.com'), 'label contains dash')
  assert.ok(is('123.256'), 'numeric labels')
  assert.ok(is('hello-4-all.xyz'), 'mixed char domain')
  assert.ok(is(puny.toASCII('æøå.xyz')), 'puny coded')

  assert.ok(is('example.com.', true), 'root dot required')
  assert.ok(is('example.com', false), 'root dot disallowed')

  assert.end()
})
