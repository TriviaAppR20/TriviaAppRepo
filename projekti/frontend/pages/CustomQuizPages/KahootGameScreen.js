import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db, auth } from '../../../backend/firebase/firebase';
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc, deleteDoc, arrayRemove } from 'firebase/firestore';


// This screen serves as the "game lobby" where players wait until the host starts the game.
//
// Key functionalities:
// - Displays a real-time list of players who have joined the lobby.
// - Hosts can start the game by initiating a countdown, after which players are redirected to the quiz screen.
// - Players can leave the lobby, and their data is removed from the database.
// - Real-time synchronization ensures that all clients see live updates in player lists, countdowns, and game status.

const KahootGameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameCode, quizTitle, gameId, creatorId } = route.params;
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);



// Sets up a real-time listener to:
// - Track the countdown timer for starting the game.
// - Determine if the current user is the host (checks if their UID matches the creator's ID).
// - Automatically navigate players to the quiz screen when the countdown reaches zero.

  useEffect(() => {
    const gameDocRef = doc(db, 'games', gameId);
    const unsubscribeGame = onSnapshot(gameDocRef, (doc) => {// Listen for changes in the game document
      if (doc.exists()) {
        const data = doc.data();
        setCountdown(data.countdown); // Update countdown timer in real-time
        setIsHost(data.creatorId === auth.currentUser?.uid); // Check if the user is the host
  
        if (data.countdown === 0) {
          navigation.navigate('QuizzScreen', { gameCode, quizId: data.quizId, gameId }); // Navigate when countdown ends
        }
      }
    });
  
    return () => unsubscribeGame(); // Cleanup listener when component unmounts
  }, [gameId, navigation, gameCode]);




// Sets up a real-time listener for the "players" subcollection in the game document.
// - Updates the local list of players whenever there are changes in the database.
// - Ensures that players are displayed accurately and in real time.

useEffect(() => {
  const playersRef = collection(db, 'games', gameId, 'players');
  const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => { // Listen for changes in the "players" subcollection
    const playersList = snapshot.docs.map((doc) => ({
      id: doc.id, // Extract the document ID (unique for each player)
      ...doc.data(), // Spread the player data from Firestore into the new object
    }));
    setPlayers(playersList); // Update the players state
    console.log('Updated players list:', playersList);
  });

  return () => unsubscribePlayers(); // Cleanup listener on component unmount
}, [gameId]);




//this ensures that only unique players are listed in the lobby

useEffect(() => {
  if (!gameStarted) { // Ensures this logic runs only if the game has not started
    const playersRef = collection(db, 'games', gameId, 'players'); // Reference to the "players" subcollection
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {  // Real-time listener for changes in the "players" collection
      
      //include the document id, spread the rest of the player data
      const playersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Ensure unique players
      const uniquePlayersMap = new Map(); // Create a Map to store unique players
      playersList.forEach((player) => uniquePlayersMap.set(player.id, player)); // Add each player to the Map using their ID as the key
      const uniquePlayers = Array.from(uniquePlayersMap.values()); // Convert the Map back into an array of unique players

      setPlayers(uniquePlayers); // Update the local players state with the unique list
      console.log('Updated players list:', uniquePlayers);
    });

    return () => unsubscribePlayers();// Cleanup the listener when the component unmounts or the game starts
  }
}, [gameId, gameStarted]); // Re-run only if gameId or gameStarted changes

  // Start the game countdown
// Starts the game by:
// - Changing the game status to "started" in the database.
// - Initializing a countdown timer for 10 seconds.
// - Continuously updates the countdown value in the database until it reaches zero.
  const startGame = async () => {
    const lobbyRef = doc(db, 'games', gameId);
    await updateDoc(lobbyRef, { status: 'started', countdown: 10 }); // Set initial countdown and status
  
    setGameStarted(true); // Update local state to indicate the game has started

    const timer = setInterval(async () => {  // Countdown logic
      const gameDoc = await getDoc(lobbyRef); // Fetch current game document
      const currentCountdown = gameDoc.data().countdown; // Get current countdown value
      if (currentCountdown > 0) {
        await updateDoc(lobbyRef, { countdown: currentCountdown - 1 }); // Decrement countdown
      } else {
        clearInterval(timer); // Clear timer when countdown reaches zero
      }
    }, 1000); //runs every second
  };


  
// Handles exiting the game for both host and players.
// - If the user is the host, deletes the entire game document.
// - If the user is a player, removes their data from the "players" subcollection.
// - Ensures proper cleanup to prevent "ghost players.""

  const exitGame = async () => {
    const playerId = auth.currentUser.uid; // Get the current user's ID
    if (playerId) {
      try { 
        // If the user is the host, delete the entire game document
        const gameDocRef = doc(db, 'games', gameId);
        const gameDoc = await getDoc(gameDocRef);
  
        if (gameDoc.exists()) {
          const gameData = gameDoc.data();
          const creatorId = gameData.creatorId;
  
          if (playerId === creatorId) { // Check if the user is the creator
            await deleteDoc(gameDocRef); // Delete the game document
            console.log('Game deleted:', gameId);
            navigation.navigate('SelectQuiz'); // Redirect to quiz selection
            return; 
          }
        } else {
          console.error('Game document not found:', gameId);
          return;
        }
      } catch (error) {
        console.error('Error while checking/deleting game document:', error.message || error);
      }
  
    // If the user is not the host, remove their player document
      try {
        const playerDocRef = doc(db, 'games', gameId, 'players', playerId);
        await deleteDoc(playerDocRef);// Delete the player's document
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
