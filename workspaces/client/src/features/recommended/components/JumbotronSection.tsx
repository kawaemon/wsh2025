import { StandardSchemaV1 } from '@standard-schema/spec';
import * as schema from '@wsh-2025/schema/src/api/schema';
import { useRef } from 'react';
import { Flipped } from 'react-flip-toolkit';
import { NavLink } from 'react-router';
import invariant from 'tiny-invariant';
import { ArrayValues } from 'type-fest';

import { Player } from '../../player/components/Player';
import { PlayerType } from '../../player/constants/player_type';
import { PlayerWrapper } from '../../player/interfaces/player_wrapper';

interface Props {
  module: ArrayValues<StandardSchemaV1.InferOutput<typeof schema.getRecommendedModulesResponse>>;
}

export const JumbotronSection = ({ module }: Props) => {
  const playerRef = useRef<PlayerWrapper>(null);

  const item = module.items[0];
  invariant(item);
  const episode = item.episode;
  invariant(episode);

  return (
    <NavLink
      viewTransition
      className="block flex h-[260px] w-full flex-row items-center justify-center overflow-hidden rounded-[8px] bg-[#171717] hover:opacity-50"
      to={`/episodes/${item.episodeId}`}
    >
      {({ isTransitioning }) => {
        return (
          <>
            <div className="grow-1 shrink-1 p-[24px]">
              <div className="mb-[16px] line-clamp-2 w-full text-center text-[22px] font-bold text-[#ffffff]">
                {episode.title}
              </div>
              <div className="line-clamp-3 w-full text-center text-[14px] font-bold text-[#ffffff]">
                {episode.description}
              </div>
            </div>

            <Flipped stagger flipId={isTransitioning ? `episode-${item.episodeId}` : 0}>
              <div className="aspect-16/9 h-full w-auto shrink-0 grow-0">
                <Player
                  loop
                  className="size-full"
                  playerRef={playerRef}
                  playerType={PlayerType.HlsJS}
                  playlistUrl={`/streams/episode/${item.episodeId}/playlist.m3u8`}
                />
              </div>
            </Flipped>
          </>
        );
      }}
    </NavLink>
  );
};
