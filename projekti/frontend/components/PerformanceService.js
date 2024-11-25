import { db } from '../../backend/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


//manages multiplayer performance statistics, including
//tracking total answers, correct answers, games won, and incorrect answers for
//specific user.

//this data is synced with the Firestore for persistence


class PerformanceService {
  //initializes the stats object to track player's quiz performance
  constructor() {
    this.stats = {
      totalAnswers: 0,
      correctAnswers: 0,
      gamesWon: 0,
    };
    this.userId = null;
  }

  //sets the user id for the service and loads the stats from the Firestore
  setUserId(userId) {
    this.userId = userId;
    this.loadStats();
  }

  //Loads the user's stats from Firestore if they exist, or keeps defaults if not.
  async loadStats() {
    if (!this.userId) return;
    const docRef = doc(db, 'playerData', this.userId); //ref to firestore db
    const docSnap = await getDoc(docRef); //fetch the doc snapshot

    //update if exists
    if (docSnap.exists()) {
      this.stats = {
        totalAnswers: docSnap.data().totalAnswers || 0,
        correctAnswers: docSnap.data().correctAnswers || 0,
        gamesWon: docSnap.data().gamesWon || 0,
        incorrectAnswers: docSnap.data().incorrectAnswers || 0, // not used now
      };
    }
  }


  //Persists the current stats to Firestore under the user's document.
  async saveStats() {
    if (!this.userId) return; //exit if no user id

    const docRef = doc(db, 'playerData', this.userId); //ref to firestore db
    await setDoc(docRef, this.stats); //set the document with the stats
  }


  // Updates stats for an answered question and persists the changes.
  //boolean isCorrect Indicates if the answer was correct.
  //and boolean [isIncorrect=false] - Optional flag for incorrect answers.
  async recordAnswer(isCorrect, isIncorrect = false) {
    await this.loadStats(); //load latest stats

    this.stats.totalAnswers += 1; //total increment
  
    if (isCorrect) {
      this.stats.correctAnswers += 1; //increment correct answers
    } else if (isIncorrect) {
      this.stats.incorrectAnswers = (this.stats.incorrectAnswers || 0) + 1; //increment incorrect
    }
  
    await this.saveStats(); //save updated stats to firestore
  }

  //Updates stats for a game win and persists the changes.
  async recordGameWin() {
    await this.loadStats();//load latest stats
    this.stats.gamesWon += 1; //increment games won
    await this.saveStats(); //save updated stats to firestore
  }


  //Retrieves the current stats object with an additional calculated field:
   //correctPercentage: The percentage of correct answers. (0% if no answers)
  getStats() {
    return {
      ...this.stats,
      correctPercentage: this.stats.totalAnswers > 0 ? (this.stats.correctAnswers / this.stats.totalAnswers) * 100 : 0,
    };
  }
}

const performanceService = new PerformanceService();
export default performanceService;