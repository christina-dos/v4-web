import { useQuery } from '@tanstack/react-query';
import { shallowEqual } from 'react-redux';

import {
  DEFAULT_MAX_AFFILIATE_SHARE,
  DEFAULT_TAKER_3_FEE,
  MAX_AFFILIATE_VIP_SHARE,
  REF_SHARE_VOLUME_CAP_USD,
} from '@/constants/affiliates';

import { useAppSelector } from '@/state/appTypes';
import { getFeeTiers } from '@/state/configsSelectors';

import { safeFetch } from '@/lib/safeFetch';
import { log } from '@/lib/telemetry';

import { useDydxClient } from './useDydxClient';
import { useEndpointsConfig } from './useEndpointsConfig';

type AffiliatesMetadata = {
  referralCode: string;
  isVolumeEligible: boolean;
  isAffiliate: boolean;
};

export const useAffiliatesInfo = (dydxAddress?: string) => {
  const { compositeClient, getAffiliateInfo, getAllAffiliateTiers } = useDydxClient();
  const feeTiers = useAppSelector(getFeeTiers, shallowEqual);
  const { affiliatesBaseUrl } = useEndpointsConfig();

  const fetchAffiliateMetadata = async () => {
    if (!compositeClient || !dydxAddress) {
      return {};
    }
    const metadataEndpoint = `${compositeClient.indexerClient.config.restEndpoint}/v4/affiliates/metadata`;
    const totalVolumeEndpoint = `${compositeClient.indexerClient.config.restEndpoint}/v4/affiliates/total_volume`;

    try {
      const [metaDataResponse, totalVolumeResponse, affiliateInfo] = await Promise.all([
        safeFetch(`${metadataEndpoint}?address=${encodeURIComponent(dydxAddress)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        safeFetch(`${totalVolumeEndpoint}?address=${encodeURIComponent(dydxAddress)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        getAffiliateInfo(dydxAddress),
      ]);

      const data: AffiliatesMetadata | undefined = await metaDataResponse.json();
      const totalVolume: { totalVolume: number } | undefined = await totalVolumeResponse.json();
      const isEligible = Boolean(data?.isVolumeEligible) || Boolean(affiliateInfo?.isWhitelisted);

      return { metadata: data, affiliateInfo, isEligible, totalVolume: totalVolume?.totalVolume };
    } catch (error) {
      log('useAffiliatesInfo', error, { metadataEndpoint });
      throw error;
    }
  };

  const fetchProgramStats = async () => {
    const endpoint = `${affiliatesBaseUrl}/v1/community/program-stats`;

    try {
      const res = await safeFetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const data = await res.json();
      return data;
    } catch (error) {
      log('useAffiliatesInfo/fetchProgramStats', error, { endpoint });
      throw error;
    }
  };

  const fetchAccountStats = async () => {
    const endpoint = `${affiliatesBaseUrl}/v1/leaderboard/account/${dydxAddress}`;

    try {
      const res = await safeFetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const data = await res.json();

      return data;
    } catch (error) {
      log('useAffiliatesInfo/fetchAccountStats', error, { endpoint });
      throw error;
    }
  };

  const fetchLastUpdated = async () => {
    const endpoint = `${affiliatesBaseUrl}/v1/last-updated`;

    try {
      const res = await safeFetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const data = await res.json();

      return data;
    } catch (error) {
      log('useAffiliatesInfo/fetchLastUpdated', error, { endpoint });
      throw error;
    }
  };

  const affiliateMetadataQuery = useQuery({
    queryKey: ['affiliateMetadata', dydxAddress, compositeClient],
    queryFn: fetchAffiliateMetadata,
    enabled: Boolean(compositeClient && dydxAddress && affiliatesBaseUrl),
  });

  const programStatsQuery = useQuery({
    queryKey: ['programStats'],
    queryFn: fetchProgramStats,
    enabled: Boolean(affiliatesBaseUrl),
  });

  const affiliateStatsQuery = useQuery({
    queryKey: ['accountStats', dydxAddress],
    queryFn: fetchAccountStats,
    enabled: Boolean(dydxAddress && affiliatesBaseUrl),
    retry: 0,
  });

  const lastUpdatedQuery = useQuery({
    queryKey: ['lastUpdated'],
    queryFn: fetchLastUpdated,
    enabled: Boolean(affiliatesBaseUrl),
  });

  const fetchAffiliateMaxEarning = async () => {
    const allAffiliateTiers = await getAllAffiliateTiers();
    const lastTier = allAffiliateTiers?.at(-1);
    const maxRevshare = lastTier
      ? lastTier.takerFeeSharePpm / 1_000_000
      : DEFAULT_MAX_AFFILIATE_SHARE;
    const taker3FeeTier = feeTiers?.[2]?.taker ?? DEFAULT_TAKER_3_FEE;

    const maxEarning = taker3FeeTier * maxRevshare * REF_SHARE_VOLUME_CAP_USD;
    const maxVipEarning = taker3FeeTier * MAX_AFFILIATE_VIP_SHARE * REF_SHARE_VOLUME_CAP_USD;
    return { maxEarning, maxVipEarning };
  };

  const affiliateMaxEarningQuery = useQuery({
    queryKey: ['affiliateMaxEarning', compositeClient, feeTiers],
    queryFn: fetchAffiliateMaxEarning,
    enabled: Boolean(compositeClient && feeTiers && affiliatesBaseUrl),
  });

  return {
    affiliateMetadataQuery,
    programStatsQuery,
    affiliateStatsQuery,
    lastUpdatedQuery,
    affiliateMaxEarningQuery,
  };
};
