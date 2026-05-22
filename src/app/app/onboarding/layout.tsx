import { redirect } from 'next/navigation';

/* Legacy path — onboarding is now embedded inside the dashboard layout.
   Redirect everything that hits /app/onboarding/* to the new location. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function OnboardingLayout(_props: { children: React.ReactNode }) {
  redirect('/app/business_dashboard/onboarding');
}
