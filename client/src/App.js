import React, { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
    const [user, setUser] = useState(null);

    return (
        <div className="App">
            <h1>Chat App</h1>
            {user ? (
                <Chat user={user} />
            ) : (
                <Login onLogin={setUser} />
            )}
        </div>
    );
}

export default App;
