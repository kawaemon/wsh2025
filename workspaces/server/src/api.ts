import 'zod-openapi/extend';

import { randomBytes } from 'node:crypto';

import * as databaseSchema from '@wsh-2025/schema/src/database/schema';
import * as schema from '@wsh-2025/schema/src/openapi/schema';
import * as bcrypt from 'bcrypt';

import { getDatabase, initializeDatabase } from '@wsh-2025/server/src/drizzle/database';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import * as cookie from 'hono/cookie';

export function registerApi(): Hono {
  const app = new Hono();

  const cookieName = 'wsh-2025-session';
  const secret = randomBytes(32).toString('base64');

  const api = app;

  api.use(compress());

  /* eslint-disable sort/object-properties */
  api.post('/initialize', async (c) => {
    await initializeDatabase();
    return c.json({});
  });

  api.get('/channels', async (c) => {
    const database = getDatabase();

    const channels = await database.query.channel.findMany({
      orderBy(channel, { asc }) {
        return asc(channel.id);
      },
      where(channel, { inArray }) {
        const ids = c.req.query('channelIds');
        if (ids != null) {
          const channelIds = ids.split(',');
          return inArray(channel.id, channelIds);
        }
        return void 0;
      },
    });
    return c.json(channels);
  });

  api.get('/channels/:channelId', async (c) => {
    const database = getDatabase();

    const channel = await database.query.channel.findFirst({
      where(channel, { eq }) {
        return eq(channel.id, c.req.param('channelId'));
      },
    });
    if (channel == null) {
      return c.text('', 404);
    }
    return c.json(channel);
  });

  api.get('/episodes', async (c) => {
    const database = getDatabase();

    const episodes = await database.query.episode.findMany({
      orderBy(episode, { asc }) {
        return asc(episode.id);
      },
      where(episode, { inArray }) {
        const ids = c.req.query('episodeIds');
        if (ids != null) {
          const episodeIds = ids.split(',');
          return inArray(episode.id, episodeIds);
        }
        return void 0;
      },
      with: {
        series: {
          with: {
            episodes: {
              orderBy(episode, { asc }) {
                return asc(episode.order);
              },
            },
          },
        },
      },
    });
    return c.json(episodes);
  });

  api.get('/episodes/:episodeId', async (c) => {
    const database = getDatabase();

    const episode = await database.query.episode.findFirst({
      where(episode, { eq }) {
        return eq(episode.id, c.req.param('episodeId'));
      },
      with: {
        series: {
          with: {
            episodes: {
              orderBy(episode, { asc }) {
                return asc(episode.order);
              },
            },
          },
        },
      },
    });
    if (episode == null) {
      return c.text('', 404);
    }
    return c.json(episode);
  });

  api.get('/series', async (c) => {
    const database = getDatabase();

    const series = await database.query.series.findMany({
      orderBy(series, { asc }) {
        return asc(series.id);
      },
      where(series, { inArray }) {
        const ids = c.req.query('seriesIds');
        if (ids != null) {
          const seriesIds = ids.split(',');
          return inArray(series.id, seriesIds);
        }
        return void 0;
      },
      with: {
        episodes: {
          orderBy(episode, { asc }) {
            return asc(episode.order);
          },
          with: {
            series: true,
          },
        },
      },
    });
    return c.json(series);
  });

  api.get('/series/:seriesId', async (c) => {
    const database = getDatabase();

    const series = await database.query.series.findFirst({
      where(series, { eq }) {
        return eq(series.id, c.req.param('seriesId'));
      },
      with: {
        episodes: {
          orderBy(episode, { asc }) {
            return asc(episode.order);
          },
          with: {
            series: true,
          },
        },
      },
    });
    if (series == null) {
      return c.text('', 404);
    }
    return c.json(series);
  });

  api.get('/timetable', async (c) => {
    const database = getDatabase();

    const programs = await database.query.program.findMany({
      orderBy(program, { asc }) {
        return asc(program.startAt);
      },
      where(program, { between, sql }) {
        // 競技のため、時刻のみで比較する
        return between(
          program.startAt,
          sql`time(${c.req.query('since')}, '+9 hours')`,
          sql`time(${c.req.query('until')}, '+9 hours')`,
        );
      },
    });

    return c.json(programs);
  });

  api.get('/programs', async (c) => {
    const database = getDatabase();

    const programs = await database.query.program.findMany({
      orderBy(program, { asc }) {
        return asc(program.startAt);
      },
      where(program, { inArray }) {
        const ids = c.req.query('programIds');
        if (ids != null) {
          const programIds = ids.split(',');
          return inArray(program.id, programIds);
        }
        return void 0;
      },
      with: {
        channel: true,
        episode: {
          with: {
            series: {
              with: {
                episodes: {
                  orderBy(episode, { asc }) {
                    return asc(episode.order);
                  },
                },
              },
            },
          },
        },
      },
    });

    return c.json(programs);
  });

  api.get('/programs/:programId', async (c) => {
    const database = getDatabase();

    const program = await database.query.program.findFirst({
      where(program, { eq }) {
        return eq(program.id, c.req.param('programId'));
      },
      with: {
        channel: true,
        episode: {
          with: {
            series: {
              with: {
                episodes: {
                  orderBy(episode, { asc }) {
                    return asc(episode.order);
                  },
                },
              },
            },
          },
        },
      },
    });
    if (program == null) {
      return c.text('', 404);
    }
    return c.json(program);
  });

  api.get('/recommended/:referenceId', async (c) => {
    const database = getDatabase();

    const modules = await database.query.recommendedModule.findMany({
      orderBy(module, { asc }) {
        return asc(module.order);
      },
      where(module, { eq }) {
        return eq(module.referenceId, c.req.param('referenceId'));
      },
      with: {
        items: {
          orderBy(item, { asc }) {
            return asc(item.order);
          },
          with: {
            series: true,
            episode: { with: { series: { columns: { title: true } } } },
          },
        },
      },
    });

    return c.json(modules);
  });

  api.post('/signIn', async (c) => {
    const database = getDatabase();
    const body = await c.req.json();

    const user = await database.query.user.findFirst({
      where(user, { eq }) {
        return eq(user.email, body.email);
      },
    });
    if (!user || !bcrypt.compareSync(body.password, user.password)) {
      return c.text('', 401);
    }

    const ret = schema.signInResponse.parse({ id: user.id, email: user.email });

    await cookie.setSignedCookie(c, cookieName, ret.id.toString(), secret, { path: '/' });
    return c.json(user);
  });

  api.post('/signUp', async (c) => {
    const database = getDatabase();
    const body = await c.req.json();

    const hasAlreadyExists = await database.query.user.findFirst({
      where(user, { eq }) {
        return eq(user.email, body.email);
      },
    });
    if (hasAlreadyExists) {
      return c.text('', 400);
    }

    const users = await database
      .insert(databaseSchema.user)
      .values({
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
      })
      .returning();

    const user = users.find((u) => u.email === body.email);
    if (!user) {
      return c.text('', 500);
    }

    const ret = schema.signUpResponse.parse({ id: user.id, email: user.email });

    await cookie.setSignedCookie(c, cookieName, ret.id.toString(), secret, { path: '/' });
    return c.json(ret);
  });

  api.get('/users/me', async (c) => {
    const database = getDatabase();

    const userId = await cookie.getSignedCookie(c, secret, cookieName);
    if (!userId) {
      return c.text('', 401);
    }

    const user = await database.query.user.findFirst({
      where(user, { eq }) {
        return eq(user.id, Number(userId));
      },
    });
    if (!user) {
      return c.text('', 401);
    }
    return c.json(user);
  });

  api.post('/signOut', async (c) => {
    const userId = await cookie.getSignedCookie(c, secret, cookieName);
    if (!userId) {
      return c.text('', 401);
    }
    await cookie.setSignedCookie(c, cookieName, '', secret, { path: '/' });
    return c.text('', 200);
  });

  return api;
  /* eslint-enable sort/object-properties */
}
