import React from 'react';

interface WorkflowFormProps {
  repoUrls: string;
  setRepoUrls: (value: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function WorkflowForm({ repoUrls, setRepoUrls, loading, handleSubmit }: WorkflowFormProps) {
  return (
    <div className="px-8 py-10 border-b border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Start Workflow</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="repoUrls" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URLs (comma-separated)
          </label>
          <input
            type="text"
            id="repoUrls"
            value={repoUrls}
            onChange={(e) => setRepoUrls(e.target.value)}
            placeholder="e.g., https://github.com/owner/repo, https://github.com/owner2/repo2"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter complete GitHub repository URLs (https://github.com/owner/repo)
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || !repoUrls.trim()}
          className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
            loading || !repoUrls.trim() ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Start Workflow'
          )}
        </button>
      </form>
    </div>
  );
}
