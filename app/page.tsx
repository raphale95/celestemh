import React from 'react';
import { QuoteProvider } from '@/context/QuoteContext';
import { WizardLayout } from '@/components/wizard/WizardLayout';

export default function Home() {
  return (
    <QuoteProvider>
      <WizardLayout />
    </QuoteProvider>
  );
}
