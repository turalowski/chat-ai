// Tries to break the row level security rules with two users and an anonymous client.
// Runs against local Supabase: `npm run db:start`, then `npm run test:rls`.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { before, describe, test } from 'node:test'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// These tests create users, so they must never run against a hosted project.
if (!/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url ?? '')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must point at local Supabase')
}

const newClient = () =>
  createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

const pdf = () => new Blob(['%PDF-1.4 test'], { type: 'application/pdf' })

async function signUp() {
  const client = newClient()
  const { data, error } = await client.auth.signUp({
    email: `${randomUUID()}@rls-test.example.com`,
    password: 'test-password-1',
  })
  assert.ifError(error)
  return { client, id: data.user.id }
}

const anon = newClient()
let alice
let bob
let alicePath
let aliceDocument
let aliceGroup

const pathInFolderOf = (user) => `${user.id}/${randomUUID()}`
const bucket = (client) => client.storage.from('documents')

before(async () => {
  alice = await signUp()
  bob = await signUp()
  alicePath = pathInFolderOf(alice)

  const upload = await bucket(alice.client).upload(alicePath, pdf())
  assert.ifError(upload.error)

  const document = await alice.client
    .from('documents')
    .insert({ path: alicePath, name: 'alice.pdf' })
    .select()
    .single()
  assert.ifError(document.error)
  aliceDocument = document.data

  const group = await alice.client
    .from('document_groups')
    .insert({ name: 'group', document_paths: [alicePath] })
    .select()
    .single()
  assert.ifError(group.error)
  aliceGroup = group.data
})

describe('storage', () => {
  test('users can download their own files', async () => {
    const { error } = await bucket(alice.client).download(alicePath)
    assert.equal(error, null)
  })

  test("other users can't download a user's files", async () => {
    const { error } = await bucket(bob.client).download(alicePath)
    assert.ok(error)
  })

  test("anonymous clients can't download files", async () => {
    const { error } = await bucket(anon).download(alicePath)
    assert.ok(error)
  })

  test("users can't upload to another user's folder", async () => {
    const { error } = await bucket(bob.client).upload(pathInFolderOf(alice), pdf())
    assert.ok(error)
  })

  test("users can't upload to the bucket root", async () => {
    const { error } = await bucket(alice.client).upload(randomUUID(), pdf())
    assert.ok(error)
  })

  test("anonymous clients can't upload", async () => {
    const { error } = await bucket(anon).upload(pathInFolderOf(alice), pdf())
    assert.ok(error)
  })

  test('only PDFs can be uploaded', async () => {
    const html = new Blob(['<html></html>'], { type: 'text/html' })
    const { error } = await bucket(alice.client).upload(pathInFolderOf(alice), html)
    assert.ok(error)
  })

  test("users can't delete another user's files", async () => {
    await bucket(bob.client).remove([alicePath])
    const { error } = await bucket(alice.client).download(alicePath)
    assert.equal(error, null)
  })

  test('users can delete their own files', async () => {
    const path = pathInFolderOf(alice)
    await bucket(alice.client).upload(path, pdf())
    await bucket(alice.client).remove([path])
    const { error } = await bucket(alice.client).download(path)
    assert.ok(error)
  })
})

describe('documents', () => {
  test('the owner defaults to the signed-in user', () => {
    assert.equal(aliceDocument.user_id, alice.id)
  })

  test('users can read their own documents', async () => {
    const { data } = await alice.client.from('documents').select()
    assert.equal(data.length, 1)
  })

  test("other users can't read a user's documents", async () => {
    const { data } = await bob.client.from('documents').select()
    assert.equal(data.length, 0)
  })

  test("anonymous clients can't read documents", async () => {
    const { data, error } = await anon.from('documents').select()
    assert.equal(error, null)
    assert.equal(data.length, 0)
  })

  test('a path can only be registered once', async () => {
    const { error } = await alice.client
      .from('documents')
      .insert({ path: alicePath, name: 'copy.pdf' })
    assert.ok(error)
  })

  test("users can't claim another user's path", async () => {
    const { error } = await bob.client
      .from('documents')
      .insert({ path: alicePath, name: 'stolen.pdf' })
    assert.ok(error)
  })

  test("users can't register a path in another user's folder", async () => {
    const { error } = await bob.client
      .from('documents')
      .insert({ path: pathInFolderOf(alice), name: 'stolen.pdf' })
    assert.ok(error)
  })

  test("users can't insert rows for another user", async () => {
    const { error } = await bob.client.from('documents').insert({
      path: pathInFolderOf(alice),
      name: 'forged.pdf',
      user_id: alice.id,
    })
    assert.ok(error)
  })

  test('names must not be empty', async () => {
    const { error } = await alice.client
      .from('documents')
      .insert({ path: pathInFolderOf(alice), name: '' })
    assert.ok(error)
  })

  test("documents can't be updated", async () => {
    const { error } = await alice.client
      .from('documents')
      .update({ name: 'renamed.pdf' })
      .eq('id', aliceDocument.id)
    assert.ok(error)
  })

  test("other users can't delete a user's documents", async () => {
    const { data } = await bob.client
      .from('documents')
      .delete()
      .eq('id', aliceDocument.id)
      .select()
    assert.equal(data.length, 0)
  })

  test('users can delete their own documents and get the path back', async () => {
    const path = pathInFolderOf(alice)
    await alice.client.from('documents').insert({ path, name: 'temp.pdf' })
    const { data } = await alice.client
      .from('documents')
      .delete()
      .eq('path', path)
      .select('path')
      .maybeSingle()
    assert.equal(data.path, path)
  })
})

describe('document groups', () => {
  test('the owner defaults to the signed-in user', () => {
    assert.equal(aliceGroup.user_id, alice.id)
  })

  test("other users can't read a user's groups", async () => {
    const { data } = await bob.client.from('document_groups').select()
    assert.equal(data.length, 0)
  })

  test("users can't insert groups for another user", async () => {
    const { error } = await bob.client
      .from('document_groups')
      .insert({ name: 'forged', document_paths: [], user_id: alice.id })
    assert.ok(error)
  })

  test("other users can't delete a user's groups", async () => {
    await bob.client.from('document_groups').delete().eq('id', aliceGroup.id)
    const { data } = await alice.client.from('document_groups').select()
    assert.equal(data.length, 1)
  })
})
