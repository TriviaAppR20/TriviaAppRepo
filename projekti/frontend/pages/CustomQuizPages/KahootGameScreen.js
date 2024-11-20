import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
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
  const { gameCode, quizTitle, gameId, creatorId } = route.params;
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
 // const [countdownStarted, setCountdownStarted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);


  // Fetch players once when component mounts

  //this should be fine now, needs some commenting

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
    const playersList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPlayers(playersList);
    console.log('Updated players list:', playersList);
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
  
    setGameStarted(true);

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
      try { // First, check if the user is the creator and delete the game if they are
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
        const playerDocRef = doc(db, 'games', gameId, 'players', playerId);
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
    <View>
      <Text>Game Code: {gameCode}</Text>
      <Text>Quiz Title: {quizTitle}</Text>
      <Text>Countdown: {countdown}</Text>
      <Text>Players:</Text>
      {players.map((player, index) => (
        <Text key={index}>{player.playerName}</Text>
      ))}
      {isHost && (
      <Button title="Start Game" onPress={startGame} disabled={gameStarted} />)}
      <Button title="Exit Lobby" onPress={exitGame} />
    </View>
  );
};

export default KahootGameScreen;
