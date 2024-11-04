import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { db } from "../../../backend/firebase/firebase";
import { doc, collection, addDoc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const QuizzScreen = () => {
  const auth = getAuth();
  const route = useRoute();
  const { gameCode, quizId } = route.params;
  const [gameId, setGameId] = useState(route.params?.gameId);
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [playersAnswered, setPlayersAnswered] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [bestPlayer, setBestPlayer] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const navigation = useNavigation();


 //this has all kinds of stuff that needs to be looked over, 
 //probably has a lot of unnecessary stuff/bloat that can be remove

// game is fetched, and then displayed to all players.
// players choose answer to be submitted to the database.
// this is used to check if every one has answered ===
// if so, then the correct answer is displayed, and the next question is displayed.
// this is repeated until all questions are answered.
// running out of time also changes the question.

// correct answers are checked and saved for each player,
// at the end, the best player is displayed, and the game is deleted after 30 seconds.
// calcultions are made for personal performance as well.


  useEffect(() => {
    // Fetch gameId if missing
    const fetchGameId = async () => {
      if (gameCode && !gameId) {
        const gamesRef = collection(db, 'games');
        const querySnapshot = await getDocs(gamesRef);
        const game = querySnapshot.docs.find((doc) => doc.data().gameCode === gameCode);
        if (game) setGameId(game.id);
        else console.error('Game with gameCode not found');
      }
    };
    fetchGameId();
  }, [gameCode, gameId]);

  useEffect(() => {
    // Load questions from quizzes document
    if (!quizId) return;
    const loadQuestions = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        if (quizDoc.exists()) setQuestions(quizDoc.data().questions || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };
    loadQuestions();
  }, [quizId]);


  // need to figure this one out
  useEffect(() => {
    // Timer countdown
    if (timeLeft === 0) {
      if (questionIndex < questions.length) {
        setShowCorrectAnswer(true);
        if (!proceeding) {
          setProceeding(true); // Prevent multiple timeouts
          setTimeout(() => proceedToNextQuestion(), 2000); // 2-second delay
        }
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prevTime) => prevTime - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questionIndex, questions.length, proceeding]);


  useEffect(() => {
    // Listen for players joining
    if (!gameId) return;
    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersList = snapshot.docs.map((doc) => doc.data());
      setPlayers(playersList);
    });
    return () => unsubscribePlayers();
  }, [gameId]);


  useEffect(() => {
    // Listen for answers
    if (!gameId) return;
    const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
    const unsubscribeAnswers = onSnapshot(currentAnswersRef, (snapshot) => {
      const answersList = snapshot.docs.map((doc) => doc.data());
      setPlayersAnswered(answersList.map((answer) => answer.playerId));

      // condition to check if all players have answered
      if (players.length > 0 && playersAnswered.length === players.length && !showCorrectAnswer && !proceeding) {
        setShowCorrectAnswer(true);
        setProceeding(true); // Prevent multiple timeouts, it has fired multiple times previously
        setTimeout(() => proceedToNextQuestion(), 2000); // 2-second delay to show correct answer
      }
    });
    return () => unsubscribeAnswers();
  }, [gameId, players.length, playersAnswered.length, showCorrectAnswer, proceeding]);

  const proceedToNextQuestion = async () => {
    clearAnswers();
    setProceeding(false); // Reset proceeding flag before moving to the next question
    if (questionIndex + 1 >= questions.length) {
      // Mark quiz as completed if there are no more questions
      setIsQuizCompleted(true);
      completeQuiz();
    } else {
      
      setQuestionIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(20); // Reset timer for new question
      setHasAnswered(false);
      setPlayersAnswered([]); // Reset playersAnswered for the new question
      setShowCorrectAnswer(false); // Hide correct answer display
    }
  };

  // this clears currentAnswers from database.
  // they are compared to the amount of players connected
  // players === currentAnswers, then the correct answer is displayed.
  const clearAnswers = async () => {
    const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
    const snapshot = await getDocs(currentAnswersRef);
    snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
  };

  const submitAnswer = async (selectedAnswer) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    const currentQuestion = questions[questionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer; // is correct
    if (isCorrect) setScore((prevScore) => prevScore + 1); //gz you got a point

    try {
      const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
      await addDoc(currentAnswersRef, {
        playerId: auth.currentUser.uid,
        answer: selectedAnswer,
        isCorrect,
        submittedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const completeQuiz = async () => {
    const playerRef = doc(db, 'games', gameId, 'players', auth.currentUser.uid);
    const percentageScore = (score / questions.length) * 100;
  
    try {
      // Update player's final score in Firestore
      await setDoc(playerRef, {
        uid: auth.currentUser.uid,
        finalScore: score,
        percentageScore,
      }, { merge: true });
  
      // Fetch the best player after saving the score
      fetchBestPlayer();
      // Delay before deleting the game
      setTimeout(deleteGame, 30000); // Delete game after 30 seconds
    } catch (error) {
      console.error("Error saving final score:", error);
    }
  };

 

  const deleteGame = async () => {
    if (!gameId) return;
    try {
      const gameRef = doc(db, 'games', gameId);
      await deleteDoc(gameRef);
    } catch (error) {
      console.error("Error deleting game:", error);
    }
    navigation.navigate('KahootHomeScreen');
  };


  //gets players and takes the score and starts to compare them
  const fetchBestPlayer = async () => {
    if (!gameId) return;
    try {
      const playersRef = collection(db, 'games', gameId, 'players');
      const snapshot = await getDocs(playersRef);
      let bestScore = -1; //
      let bestPlayerData = null; //init

      //here 
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.finalScore !== undefined && data.finalScore > bestScore) {
          bestScore = data.finalScore;
          bestPlayerData = {
            uid: data.uid,
            finalScore: data.finalScore,
            percentageScore: (data.finalScore / questions.length) * 100,
          };
        }
      });

      setBestPlayer(bestPlayerData);
    } catch (error) {
      console.error("Error fetching best player:", error);
    }
  };


  //return has conditions for showing questions, answers, and the correct answer
  //and the end screen and so forth.
  //probably needs to be cleaned up a bit and modified when approaching final version


  return (
    <View>
      {!isQuizCompleted ? (
        <>
          {questions.length > 0 && questionIndex < questions.length && (
            <>
              <Text>{questions[questionIndex].questionText}</Text>
              {questions[questionIndex].answers.map((answer, index) => (
                <Button
                  key={index}
                  title={answer}
                  onPress={() => submitAnswer(answer)}
                  disabled={hasAnswered}
                />
              ))}
              {showCorrectAnswer && (
                <Text>The correct answer was: {questions[questionIndex].correctAnswer}</Text>
              )}
              <Text>Time left: {timeLeft}</Text>
            </>
          )}
        </>
      ) : (
        <View>
          <Text>Quiz Completed!</Text>
          {bestPlayer ? (
            <>
              <Text>The BEST player was: {bestPlayer.uid}</Text>
              <Text>Final Score: {bestPlayer.finalScore}</Text>
              <Text>with a Percentage Score: {bestPlayer.percentageScore.toFixed(2)}%</Text>
            </>
          ) : (
            <Text>No players have completed the quiz.</Text>
          )}
          <Text>Your Score: {score} / {questions.length}</Text>
          <Text>Percentage: {((score / questions.length) * 100).toFixed(2)}%</Text>
        </View>
      )}
    </View>
  );
};

export default QuizzScreen;
