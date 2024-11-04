import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../../backend/firebase/firebase';
import { doc, updateDoc, collection, onSnapshot, getDoc } from 'firebase/firestore';

const KahootGameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameCode, quizTitle, gameId } = route.params;
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [countdownStarted, setCountdownStarted] = useState(false);

  // Listening to unique players joining the lobby
  useEffect(() => {
    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      // Only update players if the countdown has not started
      if (!countdownStarted) {
        const playersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Ensure unique players
        const uniquePlayersMap = new Map();
        playersList.forEach(player => uniquePlayersMap.set(player.playerId, player));
        const uniquePlayers = Array.from(uniquePlayersMap.values());

        // Update players state only if there's a change
        if (JSON.stringify(uniquePlayers) !== JSON.stringify(players)) {
          setPlayers(uniquePlayers);
          console.log('Updated unique players list:', uniquePlayers);
        }
      }
    });

    return () => unsubscribePlayers();
  }, [gameId, players]);

  // Countdown and transition to QuizScreen
  useEffect(() => {
    const gameDocRef = doc(db, 'games', gameId);
    const unsubscribeGame = onSnapshot(gameDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCountdown(data.countdown);

          // Set countdownStarted to true when countdown begins
          if (data.countdown !== null && !countdownStarted) {
            setCountdownStarted(true);
          }

        if (data.countdown === 0) {
          navigation.navigate('QuizzScreen', { gameCode, quizId: data.quizId, gameId: gameId });
        }
      }
    });

    return () => unsubscribeGame();
  }, [gameId]);

  // Start the game
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