import { shallowEqual } from 'react-redux';
import styled from 'styled-components';

import { ButtonSize } from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';

import { useBreakpoints } from '@/hooks/useBreakpoints';
import { useLaunchableMarkets } from '@/hooks/useLaunchableMarkets';
import { useStringGetter } from '@/hooks/useStringGetter';

import breakpoints from '@/styles/breakpoints';
import { layoutMixins } from '@/styles/layoutMixins';

import { Details } from '@/components/Details';
import { IconName } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Output, OutputType } from '@/components/Output';

import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { setHasDismissedPmlBanner } from '@/state/dismissable';
import { getHasDismissedPmlBanner } from '@/state/dismissableSelectors';
import { getMarketIds } from '@/state/perpetualsSelectors';

import { testFlags } from '@/lib/testFlags';

export const MarketsBanners = () => {
  const stringGetter = useStringGetter();
  const { data: launchableMarkets } = useLaunchableMarkets();
  const marketIds = useAppSelector(getMarketIds, shallowEqual);
  const { isMobile } = useBreakpoints();
  const hasDismissedPmlBanner = useAppSelector(getHasDismissedPmlBanner);
  const dispatch = useAppDispatch();

  const onDismissPmlBanner = () => {
    dispatch(setHasDismissedPmlBanner(true));
  };

  const shouldDisplayPmlBanner = testFlags.pml && !hasDismissedPmlBanner;

  return shouldDisplayPmlBanner ? (
    <$PmlBanner>
      <img src="/affiliates-hedgie.png" alt="affiliates hedgie" tw="h-8 mobile:hidden" />

      <div tw="mr-auto flex flex-col">
        <span tw="font-medium-medium">
          {stringGetter({ key: STRING_KEYS.INSTANT_MARKET_LISTINGS_ARE_LIVE })}
        </span>
        <span tw="text-color-text-0 font-base-book notTablet:text-nowrap">
          {stringGetter({ key: STRING_KEYS.LIST_ANY_MARKET })}
        </span>
      </div>

      {!isMobile && (
        <$Details
          withSeparators
          layout="rowColumns"
          items={[
            {
              key: 'live',
              label: (
                <span tw="text-color-text-2">{stringGetter({ key: STRING_KEYS.MARKETS })}</span>
              ),
              value: <Output type={OutputType.CompactNumber} value={marketIds.length} />,
            },
            {
              key: 'launchable',
              label: (
                <span tw="text-color-text-2">{stringGetter({ key: STRING_KEYS.LAUNCHABLE })}</span>
              ),
              value: <Output type={OutputType.CompactNumber} value={launchableMarkets.length} />,
            },
          ]}
        />
      )}

      <$StarsOverlay />

      <IconButton
        tw="absolute right-0.5 top-0.5 border-none"
        iconName={IconName.Close}
        size={ButtonSize.XSmall}
        onClick={onDismissPmlBanner}
      />
    </$PmlBanner>
  ) : null;
};

const $MarketsPageBanner = styled.div`
  ${layoutMixins.row}
  height: 5rem;
  border-radius: 10px;
  background-color: var(--color-layer-1);
  margin-bottom: 1rem;
  padding: 0 1.5rem;
  justify-content: space-between;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  @media ${breakpoints.desktopSmall} {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  @media ${breakpoints.tablet} {
    span,
    button {
      z-index: 1;
    }
  }
`;

const $PmlBanner = styled($MarketsPageBanner)`
  height: 8rem;
  img,
  span,
  button {
    z-index: 1;
  }

  @media ${breakpoints.mobile} {
    height: 8rem;

    span {
      font: var(--font-small-book);
    }
  }
`;

const $StarsOverlay = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 50%;
  background: var(--color-layer-0) url('/stars-background.png');
  mix-blend-mode: difference;
  z-index: 0;
`;

const $Details = styled(Details)`
  color: var(--color-text-2);
  z-index: 1;
  margin-top: 0.5rem;
  margin-right: auto;

  > :first-child {
    padding-left: 0;
  }
`;
