import React from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../contexts/UserContext";
import { OnboardingLayout } from "../components/onboarding/OnboardingLayout";
import { BasicInfoForm } from "../components/onboarding/BasicInfoForm";
import { ChessProfileForm } from "../components/onboarding/ChessProfileForm";
import { BioAndSectionsForm } from "../components/onboarding/BioAndSectionsForm";
import { SocialLinksForm } from "../components/onboarding/SocialLinksForm";
import { FeaturedVideosForm } from "../components/onboarding/FeaturedVideosForm";
import { AvailabilityForm } from "../components/onboarding/AvailabilityForm";

const OnboardingStepContent: React.FC<{ step: MasterOnboardingStep }> = ({
  step,
}) => {
  switch (step) {
    case MasterOnboardingStep.BasicInfo:
      return <BasicInfoForm />;
    case MasterOnboardingStep.ChessProfile:
      return <ChessProfileForm />;
    case MasterOnboardingStep.BioAndSections:
      return <BioAndSectionsForm />;
    case MasterOnboardingStep.SocialLinks:
      return <SocialLinksForm />;
    case MasterOnboardingStep.FeaturedVideos:
      return <FeaturedVideosForm />;
    case MasterOnboardingStep.Availability:
      return <AvailabilityForm />;
    default:
      return (
        <p className="text-center text-xs text-[#6B5A42]">
          This step is coming soon.
        </p>
      );
  }
};

const Onboarding: React.FC = () => {
  const { user, loading } = useUser();

  if (loading || !user) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  const currentStep =
    user.onboardingStatus ?? MasterOnboardingStep.BasicInfo;

  return (
    <OnboardingLayout currentStep={currentStep}>
      <OnboardingStepContent step={currentStep} />
    </OnboardingLayout>
  );
};

export default Onboarding;
