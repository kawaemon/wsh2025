import { imgHack } from '@wsh-2025/client/src/features/recommended/components/img';
import { Flipped } from 'react-flip-toolkit';
import { NavLink } from 'react-router';

interface Props {
  series: {
    id: string;
    thumbnailUrl: string;
    title: string;
  };
}

export const SeriesItem = ({ series }: Props) => {
  return (
    <NavLink viewTransition className="block w-full overflow-hidden hover:opacity-75" to={`/series/${series.id}`}>
      {({ isTransitioning }) => {
        return (
          <>
            <div className="relative overflow-hidden rounded-[8px] border-[2px] border-solid border-[#FFFFFF1F]">
              <Flipped stagger flipId={isTransitioning ? `series-${series.id}` : 0}>
                <img alt="" className="aspect-16/9 h-auto w-full" loading="lazy" src={imgHack(series.thumbnailUrl)} />
              </Flipped>
            </div>
            <div className="p-[8px]">
              <div className="line-clamp-2 text-[14px] font-bold text-[#ffffff]">{series.title}</div>
            </div>
          </>
        );
      }}
    </NavLink>
  );
};
