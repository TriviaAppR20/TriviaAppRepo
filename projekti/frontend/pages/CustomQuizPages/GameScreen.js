import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../../backend/firebase';
import { doc, updateDoc, collection, onSnapshot, getDoc } from 'firebase/firestore';

const GameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameCode, quizTitle, gameId } = route.params;
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);

  // Listening to unique players joining the lobby
  useEffect(() => {
    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersList = snapshot.docs.map((doc) => doc.data());
      
      // Ensure uniqueness, based on playerId. This is still in WIP
      // players get readded multiple times to the db.
      const uniquePlayers = playersList.filter(
        (player, index, self) =>
          index === self.findIndex((p) => p.playerId === player.playerId)
      );

      setPlayers(uniquePlayers);
      console.log('Updated unique players list:', uniquePlayers);
    });

    return () => unsubscribePlayers();
  }, [gameId]);

  // Countdown and transition to QuizScreen
  //when countdown reaches 0 everyone is transitioned to the quiz screen
  // countdown data is fetched from the db
  // also the games data is fetched from the db
  useEffect(() => {
    const gameDocRef = doc(db, 'games', gameId);
    const unsubscribeGame = onSnapshot(gameDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCountdown(data.countdown);

        if (data.countdown === 0) {
          navigation.navigate('QuizzScreen', { gameCode, quizId: data.quizId });
        }
      }
    });

    return () => unsubscribeGame();
  }, [gameId]);


  // Start the game
    // sets the countdown to 10 in the db for all players
    // and starts the countdown
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




export default GameScreen;
