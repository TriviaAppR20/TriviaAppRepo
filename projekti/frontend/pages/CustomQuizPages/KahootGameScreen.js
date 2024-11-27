import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, auth } from '../../../backend/firebase/firebase';
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc, deleteDoc, arrayRemove } from 'firebase/firestore';

// this screen is also known as the "game lobby"
//players will join and be listed, standing by until host starts the game

// currently no condition to check if user is the host,
// start button is available to all players, this needs to be fixed

//exiting from the lobby should delete user from database collection, also make sure
//no ghosts stay in for the client after exiting i.e. unsubscribe

const KahootGameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameCode, quizTitle, gameId } = route.params;
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Fetch players once when component mounts

  // yeah players are not updated realtime when they join, only when the component mounts it does
  // we will figure this out later, want to avoid re adding ancidents

  // Real-time listener for countdown updates

  useEffect(() => {
    const gameDocRef = doc(db, 'games', gameId);
    const unsubscribeGame = onSnapshot(gameDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCountdown(data.countdown);
        setIsHost(data.creatorId === auth.currentUser?.uid);
  
        if (data.countdown === 0) {
          navigation.navigate('QuizzScreen', { gameCode, quizId: data.quizId, gameId });
        }
      }
    });
  
    return () => unsubscribeGame();
  }, [gameId, navigation, gameCode]);

// Real-time listener for player lobby updates
useEffect(() => {
  const playersRef = collection(db, 'games', gameId, 'players');
  const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
    const playersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Ensure unique players
    const uniquePlayersMap = new Map();
    playersList.forEach(player => uniquePlayersMap.set(player.playerId, player));
    const uniquePlayers = Array.from(uniquePlayersMap.values());

    // Update players state
    setPlayers(uniquePlayers);
    console.log('Updated players list:', uniquePlayers);
  });

  return () => unsubscribePlayers();
}, [gameId]);

useEffect(() => {
  if (!gameStarted) {
    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Ensure unique players
      const uniquePlayersMap = new Map();
      playersList.forEach((player) => uniquePlayersMap.set(player.id, player));
      const uniquePlayers = Array.from(uniquePlayersMap.values());

      setPlayers(uniquePlayers);
      console.log('Updated players list:', uniquePlayers);
    });

    return () => unsubscribePlayers();
  }
}, [gameId, gameStarted]);

  // Start the game countdown
  const startGame = async () => {
    const lobbyRef = doc(db, 'games', gameId);
    await updateDoc(lobbyRef, { status: 'started', countdown: 10 });
  
    const timer = setInterval(async () => {
      const gameDoc = await getDoc(lobbyRef);
      const currentCountdown = gameDoc.data().countdown;
      if (currentCountdown > 0) {
        await updateDoc(lobbyRef, { countdown: currentCountdown - 1 });
      } else {
        clearInterval(timer);
      }
    }, 1000);
  };

  const exitGame = async () => {
    const playerId = auth.currentUser.uid;
    if (playerId) {
      try {
        // First, check if the user is the creator and delete the game if they are
        const gameDocRef = doc(db, 'games', gameId);
        const gameDoc = await getDoc(gameDocRef);
  
        if (gameDoc.exists()) {
          const gameData = gameDoc.data();
          const creatorId = gameData.creatorId;
  
          if (playerId === creatorId) {
            // If the current user is the creator, delete the entire game document
            await deleteDoc(gameDocRef);
            console.log('Game deleted:', gameId);
            navigation.navigate('SelectQuiz'); // Redirect after game deletion
            return; 
          }
        } else {
          console.error('Game document not found:', gameId);
          return;
        }
      } catch (error) {
        console.error('Error while checking/deleting game document:', error.message || error);
      }
  
      // If the user is not the creator, attempt to delete their player document in the subcollection
      try {
        const playerDocRef = doc(db, 'games', gameId, 'players', playerId); // Referencing with playerId as document ID
        await deleteDoc(playerDocRef);
        console.log(`Player document ${playerId} removed from game ${gameId}`);
        navigation.navigate('KahootHomeScreen'); // Redirect after player removal
      } catch (deleteError) {
        console.error('Error while deleting player document:', deleteError.message || deleteError);
      }
    } else {
      console.error('No player ID found. User may not be authenticated.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Game Lobby</Text>
      <Text style={styles.descriptionText}>Game Code: {gameCode}</Text>
      <Text style={styles.descriptionText}>Quiz Title: {quizTitle}</Text>
      <Text style={styles.descriptionText}>Countdown: {countdown}</Text>
      <Text style={styles.header}>Players:</Text>
      {players.map((player, index) => (
        <Text key={index} style={styles.playerName}>{player.playerName}</Text>
      ))}
      {isHost && (
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={exitGame}>
        <Text style={styles.buttonText}>Exit Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  descriptionText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#f87609',
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: '#f87609',
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default KahootGameScreen;
