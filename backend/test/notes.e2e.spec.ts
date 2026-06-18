import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'bun:test';
import request from 'supertest';
import type { App } from 'supertest/types';
import { setupTestApp, type TestContext } from './utils/setup-app';
import { adminEmail, adminToken, createUser, tokenFor } from './utils/auth';
import { cleanDatabase } from './utils/db-clean';

describe('Notes (e2e)', () => {
  let ctx: TestContext;
  let server: App;
  let admin: string;

  beforeAll(async () => {
    ctx = await setupTestApp();
    server = ctx.app.getHttpServer() as App;
    admin = await adminToken(ctx);
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.dataSource, adminEmail());
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  async function createNote(title: string): Promise<number> {
    const res = await request(server)
      .post('/api/notes')
      .set('Authorization', `Bearer ${admin}`)
      .send({ title, content: 'temp' })
      .expect(201);
    return res.body.id as number;
  }

  describe('POST /notes', () => {
    it('creates a note for an admin', async () => {
      const res = await request(server)
        .post('/api/notes')
        .set('Authorization', `Bearer ${admin}`)
        .send({ title: 'e2e-note', content: 'Hello' })
        .expect(201);

      expect(res.body.title).toBe('e2e-note');
      expect(res.body.content).toBe('Hello');
    });

    it('rejects a duplicate title with 400 (IsUnique)', async () => {
      await createNote('dup-note');
      await request(server)
        .post('/api/notes')
        .set('Authorization', `Bearer ${admin}`)
        .send({ title: 'dup-note' })
        .expect(400);
    });

    it('forbids creation without notes.create with 403', async () => {
      const user = await createUser(ctx, { email: 'nonotes@b.com' });
      await request(server)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenFor(ctx, user.id, user.email)}`)
        .send({ title: 'nope' })
        .expect(403);
    });
  });

  describe('GET /notes', () => {
    it('lists notes for an admin', async () => {
      await request(server)
        .get('/api/notes')
        .set('Authorization', `Bearer ${admin}`)
        .expect(200);
    });

    it('returns a single note and 404 for a missing one', async () => {
      const id = await createNote('single-note');
      await request(server)
        .get(`/api/notes/${id}`)
        .set('Authorization', `Bearer ${admin}`)
        .expect(200);
      await request(server)
        .get('/api/notes/999999')
        .set('Authorization', `Bearer ${admin}`)
        .expect(404);
    });

    it('forbids listing without notes.read with 403', async () => {
      const user = await createUser(ctx, { email: 'nonoteread@b.com' });
      await request(server)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenFor(ctx, user.id, user.email)}`)
        .expect(403);
    });
  });

  describe('PATCH /notes/:id', () => {
    it('updates a note', async () => {
      const id = await createNote('patch-note');
      const res = await request(server)
        .patch(`/api/notes/${id}`)
        .set('Authorization', `Bearer ${admin}`)
        .send({ content: 'updated' })
        .expect(200);
      expect(res.body.content).toBe('updated');
    });

    it('returns 404 for a missing note', async () => {
      await request(server)
        .patch('/api/notes/999999')
        .set('Authorization', `Bearer ${admin}`)
        .send({ content: 'x' })
        .expect(404);
    });
  });

  describe('DELETE /notes/:id', () => {
    it('deletes a note', async () => {
      const id = await createNote('delete-note');
      await request(server)
        .delete(`/api/notes/${id}`)
        .set('Authorization', `Bearer ${admin}`)
        .expect(200);
    });

    it('returns 404 for a missing note', async () => {
      await request(server)
        .delete('/api/notes/999999')
        .set('Authorization', `Bearer ${admin}`)
        .expect(404);
    });
  });
});
