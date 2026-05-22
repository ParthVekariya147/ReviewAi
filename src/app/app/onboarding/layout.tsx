import { redirect } from 'next/navigation';

/* Legacy path — onboarding is now embedded inside the dashboard layout.
   Redirect everything that hits /app/onboarding/* to the new location. */
export default function OnboardingLayout({ children: _children }: { children: React.ReactNode }) {
  redirect('/app/business_dashboard/onboarding');
}
