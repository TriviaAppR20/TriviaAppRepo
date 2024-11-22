import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../../backend/firebase/firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc, onSnapshot } from 'firebase/firestore';

const SelectQuiz = ({ navigation }) => {
  const [quizzes, setQuizzes] = useState([]);


  // SelectQuiz Component
  //
  // Purpose:
  // Manages quiz selection and lobby creation for multiplayer quiz game
  //
  // Key Functionalities:
  // - Fetches quizzes created by the current user
  // - Provides real-time updates of user's quizzes
  // - Enables creating a game lobby from selected quiz
  // - Handles navigation to game screen with generated lobby






  // Fetch quizzes created by the current user
  //
  // Uses Firebase real-time listener to:
  // - Query quizzes by current user's ID
  // - Update quizzes list dynamically
  // - Handle potential fetch errors
  useEffect(() => {
    const userId = auth.currentUser?.uid;
  
    if (userId) {  // Create query to fetch user's quizzes
      const q = query(collection(db, 'quizzes'), where('creatorId', '==', userId));
      
       // Real-time snapshot listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userQuizzes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(userQuizzes);
      }, (error) => {
        console.error("Error fetching quizzes:", error);
      });
  
      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }
  }, []);


  

  // Creates a game lobby and navigates to game screen
  //
  // Workflow:
  // - Generates unique game code
  // - Creates game document in Firestore
  // - Adds host player to game's players subcollection
  // - Navigates to game screen with lobby details
  //
  // @param {Object} quiz - Selected quiz details
const createLobbyAndNavigate = async (quiz) => {
  try {
    // Ensure latest user data is loaded
    await auth.currentUser.reload();

    // Generate unique 6-digit game code
    const gameCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate game code

    // Create game document in Firestore
    const gameDocRef = await addDoc(collection(db, 'games'), {
      gameCode: gameCode,
      status: 'open',
      quizId: quiz.id,
      quizTitle: quiz.quizTitle,
      creatorId: auth.currentUser?.uid,
      roundTime: 20,
    });
    console.log('Lobby created with code:', gameCode);

    // Add host to players subcollection with updated displayName
    const playerId = auth.currentUser?.uid;
    const playerName = auth.currentUser?.displayName || 'Anonymous';
    if (playerId) {
      await setDoc(doc(db, 'games', gameDocRef.id, 'players', playerId), {
        uid: playerId,
        playerName: playerName,
        score: 0,
      });
      console.log('Player added to the game:', playerId, playerName);
    }

    navigation.navigate('KahootGameScreen', {  // Navigate to game screen
      gameCode,
      quizTitle: quiz.quizTitle,
      gameId: gameDocRef.id,
      creatorId: playerId,
    });
  } catch (error) {
    console.error('Error creating lobby:', error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Quiz</Text>
      {quizzes.length > 0 ? (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => createLobbyAndNavigate(item)} style={styles.quizItem}>
              <Text>{item.quizTitle}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>No quizzes available. Create one!</Text>
      )}
      <Button title="Create Quiz" onPress={() => navigation.navigate('CreateQuiz')} />

      <Text>Want to generate quiz with random questions?</Text>
      <Button title="Generate Random Quiz" onPress={() => navigation.navigate('GenerateQuizKahoot')} />
    </View>
    
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  quizItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});

export default SelectQuiz;
