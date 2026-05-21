import { redirect } from 'next/navigation';

// Legacy path — all traffic redirected to the new full-screen onboarding route
export default async function OnboardingPage() {
  redirect('/app/onboarding');
}
