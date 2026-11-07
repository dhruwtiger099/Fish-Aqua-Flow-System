import React from 'react';

function SkeletonBlock({ className = '' }) {
  return <span className={`app-skeleton__block ${className}`} aria-hidden="true" />;
}

export default function AppSkeleton() {
  return (
    <main className="app-skeleton" aria-label="Loading Aqua Flow dashboard" role="status">
      <div className="app-skeleton__navbar">
        <div className="app-skeleton__brand">
          <SkeletonBlock className="app-skeleton__logo" />
          <SkeletonBlock className="app-skeleton__brand-line" />
        </div>
        <div className="app-skeleton__nav-actions">
          <SkeletonBlock className="app-skeleton__nav-pill" />
          <SkeletonBlock className="app-skeleton__avatar" />
        </div>
      </div>

      <div className="app-skeleton__layout">
        <aside className="app-skeleton__sidebar">
          <SkeletonBlock className="app-skeleton__side-title" />
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBlock key={index} className="app-skeleton__side-item" />
          ))}
        </aside>

        <section className="app-skeleton__content">
          <div className="app-skeleton__heading">
            <SkeletonBlock className="app-skeleton__heading-line" />
            <SkeletonBlock className="app-skeleton__heading-action" />
          </div>
          <div className="app-skeleton__cards">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="app-skeleton__card" key={index}>
                <SkeletonBlock className="app-skeleton__small-line" />
                <SkeletonBlock className="app-skeleton__value-line" />
                <SkeletonBlock className="app-skeleton__caption-line" />
              </div>
            ))}
          </div>
          <div className="app-skeleton__table">
            <SkeletonBlock className="app-skeleton__table-title" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="app-skeleton__table-row" key={index}>
                <SkeletonBlock />
                <SkeletonBlock />
                <SkeletonBlock />
                <SkeletonBlock />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
