import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../../backend/firebase/firebase';
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc } from 'firebase/firestore';



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

      // Navigate to QuizScreen when countdown reaches 0
      if (data.countdown === 0) {
        navigation.navigate('QuizzScreen', { gameCode, quizId: data.quizId, gameId: gameId });
      }
    }
  });

  return () => unsubscribeGame();
}, [gameId]);


  // Listener for players joining the lobby
  useEffect(() => {
    if (!gameStarted) {
      const playersRef = collection(db, 'games', gameId, 'players');
      const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
        const playersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Ensure unique players, no testing has been done for this, probably does its job
        const uniquePlayersMap = new Map();
        playersList.forEach(player => uniquePlayersMap.set(player.playerId, player));
        const uniquePlayers = Array.from(uniquePlayersMap.values());

        // Update players state
        setPlayers(uniquePlayers);
        console.log('Updated players list:', uniquePlayers);
      });

      return () => unsubscribePlayers();
    }
  }, [gameStarted, gameId]);


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

  return (
    <View>
      <Text>Game Code: {gameCode}</Text>
      <Text>Quiz Title: {quizTitle}</Text>
      <Text>Countdown: {countdown}</Text>
      <Text>Players:</Text>
      {players.map((player, index) => (
        <Text key={index}>{player.playerName}</Text>
      ))}
      <Button title="Start Game" onPress={startGame} />
    </View>
  );
};

export default KahootGameScreen;
