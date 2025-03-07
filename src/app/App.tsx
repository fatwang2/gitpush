import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WorkflowForm } from './components/WorkflowForm';
import { WorkflowStatusDisplay } from './components/WorkflowStatus';
import { WorkflowStatus } from './type';

export default function App() {
  const [repoUrls, setRepoUrls] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const processedUrls = repoUrls.split(',').map(url => url.trim());
      const requestBody = {
        repo_urls: processedUrls
      };

      const response = await fetch('/api/workflow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      setWorkflowStatus(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (id: string) => {
    try {
      const response = await fetch('/api/workflow/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId: id }),
      });
      const data = await response.json();
      console.log('Status response:', data);
      
      setWorkflowStatus(prev => {
        if (!prev) return null;
        return {
          id: prev.id,
          status: {
            output: data
          }
        };
      });
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  useEffect(() => {
    if (workflowStatus?.id) {
      const interval = setInterval(() => {
        checkStatus(workflowStatus.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [workflowStatus?.id]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Form Section */}
          <WorkflowForm
            repoUrls={repoUrls}
            setRepoUrls={setRepoUrls}
            loading={loading}
            handleSubmit={handleSubmit}
          />

          {/* Error Message */}
          {error && (
            <div className="px-8 py-4 bg-red-50 border-b border-red-100">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Status Section */}
          {workflowStatus && (
            <WorkflowStatusDisplay workflowStatus={workflowStatus} />
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} GitPush. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 