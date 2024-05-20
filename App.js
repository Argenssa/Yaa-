// App.js
import React from 'react';
import Navigation from './Navigation';
import { UserProvider } from './src/components/userContext';
import { PlayerProvider } from './src/components/PlayerContext'; // Import PlayerProvider
import {FavoriteTracksProvider} from "./src/components/FavoriteTracksContext";

const App = () => {
    return (
        <UserProvider>
            <FavoriteTracksProvider>
            <PlayerProvider>
                <Navigation />
            </PlayerProvider>
            </FavoriteTracksProvider>
        </UserProvider>
    );
};

export default App;
