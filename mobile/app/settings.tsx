import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SettingsModal } from '@/components/SettingsModal';
import { useAppContext } from '@/context/AppContext';
import { Currency, AllExchangeRates, RateEntry } from '@/types';
import { getFullRateMatrix, applyRateUpdate } from '@/services/exchangeRateService';

const SettingsScreen = () => {
  const { appSettings, setAppSettings, exchangeRateState, setExchangeRates } = useAppContext();
  const router = useRouter();
  const params = useLocalSearchParams();

  const { modalForInputCurrency, modalForOutputCurrency } = params;

  const activeRateData = useMemo(() => {
    const rates: AllExchangeRates = {};
    const allKnownPairs = new Set([
      ...Object.keys(exchangeRateState.officialRates),
      ...Object.keys(exchangeRateState.manualRates)
    ]);

    for (const pairKey of allKnownPairs) {
      const preferredType = exchangeRateState.preferredRateTypes[pairKey];
      const manualRate = exchangeRateState.manualRates[pairKey];
      const officialRate = exchangeRateState.officialRates[pairKey];

      let rateToUse: RateEntry | undefined = undefined;

      if (preferredType === 'manual' && manualRate) {
        rateToUse = manualRate;
      } else if (preferredType === 'oficial') {
        rateToUse = officialRate;
      } else {
        rateToUse = manualRate || officialRate;
      }

      if (rateToUse) {
        rates[pairKey] = rateToUse;
      }
    }
    return rates;
  }, [exchangeRateState.officialRates, exchangeRateState.manualRates, exchangeRateState.preferredRateTypes]);

  const rateMatrix = useMemo(() => getFullRateMatrix(activeRateData, exchangeRateState.officialRates), [activeRateData, exchangeRateState.officialRates]);

  const handleSaveManualRate = (from: Currency, to: Currency, newRateValue: number) => {
    setExchangeRates(prev => {
      const updatedManualRates = applyRateUpdate(prev.manualRates, from, to, newRateValue, 'Manual');
      return { ...prev, manualRates: updatedManualRates };
    });
  };

  const handleSetPreferredRateType = (pairKey: string, type: 'oficial' | 'manual') => {
    setExchangeRates(prev => ({
      ...prev,
      preferredRateTypes: {
        ...prev.preferredRateTypes,
        [pairKey]: type,
      },
    }));
  };

  return (
    <View style={{ flex: 1 }}>
      <SettingsModal
        isOpen={true} // The modal is always open when this screen is active
        onClose={() => router.back()}
        modalForInputCurrency={modalForInputCurrency as Currency}
        modalForOutputCurrency={modalForOutputCurrency as Currency}
        officialRatesData={exchangeRateState.officialRates}
        manualRatesData={exchangeRateState.manualRates}
        preferredRateTypes={exchangeRateState.preferredRateTypes}
        rateMatrix={rateMatrix}
        onSaveManualRate={handleSaveManualRate}
        onSetPreferredRateType={handleSetPreferredRateType}
        appSettings={appSettings}
        onAppSettingsChange={setAppSettings}
        lastUpdateDate={exchangeRateState.lastCloudFetchDate || null}
      />
    </View>
  );
};

export default SettingsScreen;