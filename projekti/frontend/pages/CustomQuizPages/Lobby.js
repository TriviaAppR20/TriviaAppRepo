import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, onSnapshot, addDoc, setDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Lobby = () => {
  const navigation = useNavigation();
  const [gameCode, setGameCode] = useState('');
  const [lobbyData, setLobbyData] = useState(null);
  const [anonymousName, setAnonymousName] = useState('');
  const [isChoosingName, setIsChoosingName] = useState(false);
  const db = getFirestore();
  const auth = getAuth();

// The Lobby screen manages joining a game lobby using Firebase Firestore and Auth.
// Users can enter a game code to join, and if the game exists and hasn't started, they're added to the lobby.
// Key features include:
// - Supporting both anonymous users and authenticated users (e.g., email/password accounts).
// - Allowing anonymous users to choose a name before joining.
// - Adding players to a Firestore players subcollection for real-time updates.
// - Handling various edge cases (invalid game code, game already started, user not authenticated).
// - Navigating successfully joined users to the game screen.



// Adds a player to the Firestore 'players' subcollection under the specified game
// Players are identified by their UID and have attributes like name and join time
  const addPlayerToLobby = async (gameId, playerId, playerName) => {
    try {
      await setDoc(doc(db, 'games', gameId, 'players', playerId), {
        playerId,
        playerName,
        joinedAt: new Date(),// Stores the timestamp of joining, not currently used for anything
      });
      console.log('Player added to the lobby:', playerName);
    } catch (error) {
      console.error('Error adding player to the lobby:', error); //firestore errors
      alert('Failed to join the lobby. Please try again.');
    }
  };

 


// Tries to join a game lobby using the entered game code
// - Checks if the game exists
// - Verifies the game hasn't started
// - Ensures anonymous users choose a name before joining
  const handleJoinLobby = () => {
      // Queries the 'games' collection for a document matching the entered game code
    const q = query(collection(db, 'games'), where('gameCode', '==', gameCode));

      // Listener for real-time changes to the query results
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) { // If a matching game document is found
        const lobbyDoc = querySnapshot.docs[0]; //get the first document
        setLobbyData({ id: lobbyDoc.id, ...lobbyDoc.data() }); // Update local state with lobby data
        console.log('Lobby data fetched:', lobbyDoc.data());

        const gameStatus = lobbyDoc.data().status;//get the status of the game, used to check if the game has started
        const currentUser = auth.currentUser; //get the current user

        if (currentUser) { //is authenticated
          if (gameStatus !== 'started') { //if the game has not started
            // Handle anonymous users who haven't chosen a name
            if (currentUser.isAnonymous && !anonymousName.trim()) {
              setIsChoosingName(true); //prompt for a name
              unsubscribe(); // Stop listening while name is chosen
            } else { 
              // Determine the player's name (anonymous or authenticated)
              const playerName = currentUser.isAnonymous
                ? anonymousName
                : currentUser.playerName || currentUser.displayName; // Use player's display name or email
              addPlayerToLobby(lobbyDoc.id, currentUser.uid, playerName); //adds the player to the lobby

              // Stop listening and navigate to the game screen
              unsubscribe();
              navigation.navigate('KahootGameScreen', {
                gameCode: lobbyDoc.data().gameCode, //pass the game code
                quizTitle: lobbyDoc.data().quizTitle, //pass the quiztitle
                gameId: lobbyDoc.id, //and the game id
              });
            }
          } else {
            console.warn('Game has already started. Cannot join.');
            alert('The game has already started. You cannot join at this time.');
          }
        } else {
          console.warn('User not authenticated');
          alert('You must be logged in to join the lobby.');
        }
      } else {
        alert('Invalid game code!');
      }
    });

    return unsubscribe; //returns the unsubscribe for cleanup
  };

// Handles anonymous users choosing a name and retrying the join process
  const handleSaveNameAndJoin = () => {
    if (anonymousName.trim()) { //ensure a valid name is entered
      setIsChoosingName(false); //exit the name choosing mode
      handleJoinLobby(); // Retry joining after name is set
    } else {
      Alert.alert('Error', 'Please enter a valid name.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lobby</Text>
      {isChoosingName ? (
        <>
          <TextInput
            placeholder="Choose your name"
            value={anonymousName}
            onChangeText={setAnonymousName}
            style={styles.input}
          />
          <Button title="Save Name & Join Lobby" onPress={handleSaveNameAndJoin} />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Enter game code"
            value={gameCode}
            onChangeText={setGameCode}
            style={styles.input}
          />
          <Button title="Join Lobby" onPress={handleJoinLobby} />
        </>
      )}
      {lobbyData && (
        <View>
          <Text>Lobby Data:</Text>
          <Text>{JSON.stringify(lobbyData)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});

export default Lobby;