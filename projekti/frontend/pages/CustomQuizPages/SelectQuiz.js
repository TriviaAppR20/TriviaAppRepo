import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../../backend/firebase/firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc, onSnapshot } from 'firebase/firestore';

const SelectQuiz = ({ navigation }) => {
  const [quizzes, setQuizzes] = useState([]);

  //fetch quizzes created by the user id
  useEffect(() => {
    const userId = auth.currentUser?.uid;
  
    if (userId) {
      const q = query(collection(db, 'quizzes'), where('creatorId', '==', userId));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userQuizzes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(userQuizzes);
      }, (error) => {
        console.error("Error fetching quizzes:", error);
      });
  
      // Unsubscribe when the component unmounts
      return () => unsubscribe();
    }
  }, []);

//choosing quiz creates a lobby
//create a lobby and navigate to GameScreen where players can join
const createLobbyAndNavigate = async (quiz) => {
  try {
    const gameCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate game code
    const gameDocRef = await addDoc(collection(db, 'games'), {
      gameCode: gameCode,
      status: 'open',
      quizId: quiz.id,
      quizTitle: quiz.quizTitle,
      creatorId: auth.currentUser?.uid,
      roundTime: 20,
    });
    console.log('Lobby created with code:', gameCode);

    // adds host as a player in the subcollection, its initializes here for all players
    // but just incase it exists in the Lobby addPlayerToLobby
    const playerId = auth.currentUser?.uid;
    if (playerId) {
      await setDoc(doc(db, 'games', gameDocRef.id, 'players', playerId), {
        uid: playerId,
        displayName: auth.currentUser?.displayName || 'Anonymous',
        score: 0,
      });
      console.log('Player added to the game:', playerId);
    } 

    navigation.navigate('KahootGameScreen', { gameCode, quizTitle: quiz.quizTitle, gameId: gameDocRef.id, creatorId: playerId});

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
              <Text style={styles.quizTitle}>{item.quizTitle}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.descriptionText}>No quizzes available. Create one!</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateQuiz')}>
        <Text style={styles.buttonText}>Create Quiz</Text>
      </TouchableOpacity>

      <Text style={styles.descriptionText}>Want to generate quiz with random questions?</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GenerateQuizKahoot')}>
        <Text style={styles.buttonText}>Generate Random Quiz</Text>
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
  quizItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f87609',
    borderRadius: 12,
    marginVertical: 10,
  },
  quizTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 8,
  },
});

export default SelectQuiz;
