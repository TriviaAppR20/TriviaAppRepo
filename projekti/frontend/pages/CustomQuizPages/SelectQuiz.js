import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../../backend/firebase/firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';

const SelectQuiz = ({ navigation }) => {
  const [quizzes, setQuizzes] = useState([]);

  //fetch quizzes created by the user id
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const q = query(collection(db, 'quizzes'), where('creatorId', '==', userId));
          const querySnapshot = await getDocs(q);
          const userQuizzes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuizzes(userQuizzes);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
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



    navigation.navigate('KahootGameScreen', { gameCode, quizTitle: quiz.quizTitle, gameId: gameDocRef.id });

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
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  quizItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});

export default SelectQuiz;
