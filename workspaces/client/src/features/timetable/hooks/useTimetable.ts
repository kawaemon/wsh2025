import { DateTime } from 'luxon';
import { ArrayValues } from 'type-fest';
import { shallow } from 'zustand/shallow';

import { useStore } from '@wsh-2025/client/src/app/StoreContext';

type ChannelId = string;

export function useTimetable() {
  return useStore(
    (state) => {
      const channels = Object.values(state.features.channel.channels);
      const programs = Object.values(state.features.timetable.programs);

      const record: Record<ChannelId, ArrayValues<typeof programs>[]> = {};

      for (const channel of channels) {
        const filteredPrograms = [];

        // TODO: minor: 高速化できそうではある
        for (const program of programs) {
          if (program.channelId === channel.id) {
            filteredPrograms.push(program);
          }
        }

        record[channel.id] = filteredPrograms.sort((a, b) => {
          return DateTime.fromISO(a.startAt).toMillis() - DateTime.fromISO(b.startAt).toMillis();
        });
      }

      return record;
    },
    (a, b) => {
      const akeys = Object.keys(a);
      const bkeys = Object.keys(b);

      if (!shallow(new Set(akeys), new Set(bkeys))) {
        return false;
      }

      return akeys.every((ak) => shallow(a[ak], b[ak]));
    },
  );
}
