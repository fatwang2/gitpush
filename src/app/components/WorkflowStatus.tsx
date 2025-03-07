import React from 'react';
import { WorkflowStatus as WorkflowStatusType } from '../types';

interface WorkflowStatusProps {
  workflowStatus: WorkflowStatusType;
}

export function WorkflowStatusDisplay({ workflowStatus }: WorkflowStatusProps) {
  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Workflow Status</h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ID: {workflowStatus.id.substring(0, 8)}...
        </span>
      </div>
      
      {/* Display formatted HTML content if available */}
      {workflowStatus.status?.output?.html ? (
        <div className="bg-gray-50 rounded-md overflow-hidden">
          <div 
            className="prose prose-sm max-w-none p-4"
            dangerouslySetInnerHTML={{ 
              __html: workflowStatus.status.output.html 
            }} 
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-md">
          <div className="flex flex-col items-center text-gray-500">
            <svg className="animate-spin mb-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium">Processing your request...</p>
            <p className="text-xs mt-1">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
}
