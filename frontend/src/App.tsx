import React, { useState } from 'react';
import './App.css';
import { UploadForm } from './components/UploadForm';
import { UserList } from './components/UserList';
import { SummaryView } from './components/SummaryView';

function App() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Capital Insight</h1>
      <UploadForm />
      <hr className="my-4" />
      <UserList onSelectUser={setSelectedUser} />
      {selectedUser && (
        <div className="mt-6">
          <SummaryView userId={selectedUser} />
        </div>
      )}
    </div>
  );
}

export default App;