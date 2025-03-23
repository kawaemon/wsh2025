import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dedent from 'dedent';
import { DateTime } from 'luxon';
import { serveStatic } from '@hono/node-server/serve-static';

import { getDatabase } from '@wsh-2025/server/src/drizzle/database';
import { Hono } from 'hono';

const SEQUENCE_DURATION_MS = 2 * 1000;
const SEQUENCE_COUNT_PER_PLAYLIST = 10;

// 競技のため、時刻のみを返す
function getTime(d: Date): number {
  return d.getTime() - DateTime.fromJSDate(d).startOf('day').toMillis();
}

export function registerStreams(): Hono {
  const app = new Hono();
  app.use(
    '/streams/',
    serveStatic({
      onFound: (_p, c) => {
        c.header('cache-control', 'public, max-age=2592000, immutable');
      },
      root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../streams'),
    }),
  );

  app.get('/streams/episode/:episodeId/playlist.m3u8', async (c) => {
    const database = getDatabase();

    const episode = await database.query.episode.findFirst({
      where(episode, { eq }) {
        return eq(episode.id, c.req.param('episodeId'));
      },
      with: {
        stream: true,
      },
    });

    if (episode == null) {
      throw new Error('The episode is not found.');
    }

    const stream = episode.stream;

    const playlist = dedent`
      #EXTM3U
      #EXT-X-TARGETDURATION:3
      #EXT-X-VERSION:3
      #EXT-X-MEDIA-SEQUENCE:1
      ${Array.from({ length: stream.numberOfChunks }, (_, idx) => {
        return dedent`
          #EXTINF:2.000000,
          /streams/${stream.id}/${String(idx).padStart(3, '0')}.ts
        `;
      }).join('\n')}
      #EXT-X-ENDLIST
    `;

    c.header('Content-Type', 'application/vnd.apple.mpegurl');
    return c.body(playlist);
  });

  app.get('/streams/channel/:channelId/playlist.m3u8', async (c) => {
    const database = getDatabase();

    const firstSequence = Math.floor(Date.now() / SEQUENCE_DURATION_MS) - SEQUENCE_COUNT_PER_PLAYLIST;
    const playlistStartAt = new Date(firstSequence * SEQUENCE_DURATION_MS);

    const playlist = [
      dedent`
        #EXTM3U
        #EXT-X-TARGETDURATION:3
        #EXT-X-VERSION:3
        #EXT-X-MEDIA-SEQUENCE:${firstSequence}
        #EXT-X-PROGRAM-DATE-TIME:${playlistStartAt.toISOString()}
      `,
    ];

    for (let idx = 0; idx < SEQUENCE_COUNT_PER_PLAYLIST; idx++) {
      const sequence = firstSequence + idx;
      const sequenceStartAt = new Date(sequence * SEQUENCE_DURATION_MS);

      const program = await database.query.program.findFirst({
        orderBy(program, { asc }) {
          return asc(program.startAt);
        },
        where(program, { and, eq, lt, lte, sql }) {
          // 競技のため、時刻のみで比較する
          return and(
            lte(program.startAt, sql`time(${sequenceStartAt.toISOString()}, '+9 hours')`),
            lt(sql`time(${sequenceStartAt.toISOString()}, '+9 hours')`, program.endAt),
            eq(program.channelId, c.req.param('channelId')),
          );
        },
        with: {
          episode: {
            with: {
              stream: true,
            },
          },
        },
      });

      if (program == null) {
        break;
      }

      const stream = program.episode.stream;
      const sequenceInStream = Math.floor(
        (getTime(sequenceStartAt) - getTime(new Date(program.startAt))) / SEQUENCE_DURATION_MS,
      );
      const chunkIdx = sequenceInStream % stream.numberOfChunks;

      playlist.push(
        dedent`
          ${chunkIdx === 0 ? '#EXT-X-DISCONTINUITY' : ''}
          #EXTINF:2.000000,
          /streams/${stream.id}/${String(chunkIdx).padStart(3, '0')}.ts
          #EXT-X-DATERANGE:${[
            `ID="arema-${sequence}"`,
            `START-DATE="${sequenceStartAt.toISOString()}"`,
            `DURATION=2.0`,
            `X-AREMA-INTERNAL="${randomBytes(3 * 1024 * 1024).toString('base64')}"`,
          ].join(',')}
        `,
      );
    }

    c.header('Content-Type', 'application/vnd.apple.mpegurl');
    return c.body(playlist.join('\n'));
  });

  return app;
}
