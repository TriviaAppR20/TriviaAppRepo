import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Lobby = () => {
  const navigation = useNavigation();
  const [gameCode, setGameCode] = useState('');
  const [lobbyData, setLobbyData] = useState(null);
  const db = getFirestore();
  const auth = getAuth();



  // Join the lobby with the given game code
  // adds players data to the game subcollection 'players'
  // this is where all of the players who have joined are listed as array
  // this is why we can sync countdowns and question between all players
  const addPlayerToLobby = async (gameId, playerId, playerName) => {
    try {
      await addDoc(collection(db, 'games', gameId, 'players'), {
        playerId,
        playerName,
        joinedAt: new Date(),
      });
      console.log('Player added to the lobby:', playerName);
    } catch (error) {
      console.error('Error adding player to the lobby:', error);
      alert('Failed to join the lobby. Please try again.');
    }
  };



  const handleJoinLobby = () => {
    const q = query(collection(db, 'games'), where('gameCode', '==', gameCode));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const lobbyDoc = querySnapshot.docs[0];
        setLobbyData({ id: lobbyDoc.id, ...lobbyDoc.data() });
        console.log('Joined lobby:', lobbyDoc.data());

        // Add the current player to the lobby
        const currentUser = auth.currentUser;
        if (currentUser) {
          addPlayerToLobby(lobbyDoc.id, currentUser.uid, currentUser.email || 'Anonymous');
        } else {
          console.warn('User not authenticated');
          alert('You must be logged in to join the lobby.');
        }

        // Navigate to GameScreen
        navigation.navigate('KahootGameScreen', {
          gameCode: lobbyDoc.data().gameCode,
          quizTitle: lobbyDoc.data().quizTitle,
          gameId: lobbyDoc.id,
        });
      } else {
        alert('Invalid game code!');
      }
    });
    return unsubscribe;
  };

  return (
    <View style={styles.container}>
      <Text>Lobby</Text>
      <TextInput
        placeholder="Enter game code"
        value={gameCode}
        onChangeText={setGameCode}
        style={styles.input}
      />
      <Button title="Join Lobby" onPress={handleJoinLobby} />
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
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});

export default Lobby;