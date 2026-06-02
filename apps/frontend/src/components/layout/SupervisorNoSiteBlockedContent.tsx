import type { ReactNode } from 'react';
import SupervisorNoSiteIndicator from './SupervisorNoSiteIndicator';

const APP_SIDEBAR_WIDTH = '16rem';

type SupervisorNoSiteBlockedContentProps = {
  children: ReactNode;
};

export default function SupervisorNoSiteBlockedContent({ children }: SupervisorNoSiteBlockedContentProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 flex-col select-none blur-sm" aria-hidden>
        {children}
      </div>
      <div
        className="pointer-events-none fixed inset-y-0 z-30 flex items-center justify-center p-6"
        style={{ left: APP_SIDEBAR_WIDTH, right: 0 }}
        role="status"
        aria-live="polite"
      >
        <SupervisorNoSiteIndicator className="max-w-md shadow-md" />
      </div>
    </div>
  );
}
