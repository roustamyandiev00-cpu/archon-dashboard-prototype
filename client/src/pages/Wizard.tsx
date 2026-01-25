/**
 * Mobile Wizard Page
 * Entry point for field-to-invoice workflow
 */

import { WizardContainer, useWizardDraft } from "../components/field-to-invoice/WizardContainer";
import { Step1Customer } from "../components/field-to-invoice/steps/Step1Customer";
import { Step2Site } from "../components/field-to-invoice/steps/Step2Site";
import { Step3Measurements } from "../components/field-to-invoice/steps/Step3Measurements";
import { Step4Media } from "../components/field-to-invoice/steps/Step4Media";
import { Step5Description } from "../components/field-to-invoice/steps/Step5Description";
import { Step6Quote } from "../components/field-to-invoice/steps/Step6Quote";

export default function WizardPage() {
  const handleComplete = (draftId: string) => {
    console.log('Wizard completed with draft:', draftId);
    // In real app, this would:
    // 1. Save the quote to database
    // 2. Navigate to quote details page
    // 3. Or show success message
    alert(`Offerte opgeslagen! ID: ${draftId}`);
  };

  const handleCancel = () => {
    console.log('Wizard cancelled');
  };

  return (
    <WizardContainer
      title="Nieuwe Offerte"
      onComplete={handleComplete}
      onCancel={handleCancel}
    >
      {({ step }) => {
        switch (step) {
          case 1:
            return <Step1Customer />;
          case 2:
            return <Step2Site />;
          case 3:
            return <Step3Measurements />;
          case 4:
            return <Step4Media />;
          case 5:
            return <Step5Description />;
          case 6:
            return <Step6Quote />;
          default:
            return (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400">Ongeldige stap</p>
              </div>
            );
        }
      }}
    </WizardContainer>
  );
}
