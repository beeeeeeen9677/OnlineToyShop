function LoadingPanel() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700/50 z-50">
      <div className="animate-spin rounded-full border-8  border-gray-200 border-t-primary h-16 w-16"></div>
    </div>
  );
}

export default LoadingPanel;
