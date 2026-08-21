export default function ArticleLoading() {
  return <main className="loadingPage articleLoading" aria-busy="true" aria-label="Loading article"><div className="loadingShell narrowLoading"><div className="skeleton skeletonEyebrow"/><div className="skeleton skeletonTitle"/><div className="skeleton skeletonLead"/><div className="skeleton skeletonHero"/><div className="skeleton skeletonParagraph"/><div className="skeleton skeletonParagraph short"/></div></main>;
}
