const question = document.getElementById("question"),
  choices = Array.from(document.getElementsByClassName("choice-text"));
const questionCounterText = document.getElementById("question-counter");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progress-bar-full");
const endGame = document.getElementById("end");
let homePage = document.getElementById("home-page"),
  playButton = document.getElementById("play-btn"),
  gameSection = document.getElementById("game");
// const loader = document.getElementById("loader");
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];

fetch(
  "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple"
)
  .then((res) => {
    return res.json();
  })
  .then((loadedQuestion) => {
    console.log(loadedQuestion.results);
    questions = loadedQuestion.results.map((result) => {
      const formatedQuestion = {
        question: result.question,
      };
      const answerChoices = [...result.incorrect_answers];
      formatedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      answerChoices.splice(
        formatedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );
      answerChoices.forEach((choice, index) => {
        formatedQuestion["choice" + (index + 1)] = choice;
      });
      return formatedQuestion;
    });
    // loader.classList.add("hidden");
    // gameSection.classList.remove("hidden");
    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

playButton.onclick = function () {
  homePage.classList.add("hidden");
  gameSection.classList.remove("hidden");
};

const username = document.getElementById("username");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const finalScore = document.getElementById("finalScore");

getNewQuestions = () => {
  if (availableQuestions === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    const mostRecentScore = localStorage.getItem("mostRecentScore");
    finalScore.innerText = mostRecentScore;
    gameSection.classList.add("hidden");
    endGame.classList.remove("hidden");
  }

  questionCounter++;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
  questionCounterText.innerText = `${questionCounter} / ${MAX_QUESTIONS}`;
  let questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = currentQuestion.question;
  choices.forEach((choice) => {
    const number = choice.dataset[`number`];
    choice.innerText = currentQuestion[`choice` + number];
  });
  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;
};

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;
    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset.number;
    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
    if (classToApply == "correct") {
      increamentScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);
    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestions();
    }, 1000);
  });
});

increamentScore = (num) => {
  score += num;
  scoreText.innerText = score;
};

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestions();
};

username.addEventListener("keyup", () => {
  saveScoreBtn.disabled = !username.value;
});

const hightScores = JSON.parse(localStorage.getItem("hightScores")) || [];
console.log(hightScores);
saveHightScore = (e) => {
  console.log("you clicked the save btn");
  e.preventDefault();
  const mostRecentScore = localStorage.getItem("mostRecentScore");
  const score = {
    score: mostRecentScore,
    name: username.value,
  };
  hightScores.push(score);
  hightScores.sort((a, b) => {
    return b.score - a.score;
  });
  hightScores.splice(5);
  localStorage.setItem("hightScores", JSON.stringify(hightScores));
  console.log(hightScores);
};

const goGame = document.getElementById("go-game");
goGame.onclick = () => {
  gameSection.classList.remove("hidden");
  homePage.classList.add("hidden");
  endGame.classList.add("hidden");
  // gameSection.classList.remove("hidden");
  startGame();
  scoreText.innerText = score;
};

const backHome = document.getElementById("back-home");
const goHome = document.getElementById("go-home");

goHome.onclick = function () {
  hightScoreSection.classList.add("hidden");
  endGame.classList.add("hidden");
  homePage.classList.remove("hidden");
  scoreText.innerText = 0;
  progressBarFull.style.width = `0%`;
  startGame();
};

backHome.onclick = function () {
  hightScoreSection.classList.add("hidden");
  endGame.classList.add("hidden");
  homePage.classList.remove("hidden");
};

const getHightScores = document.getElementById("get-hight-scores");
const hightScoreSection = document.getElementById("hight_score");

getHightScores.onclick = function () {
  hightScoreSection.classList.remove("hidden");
  homePage.classList.add("hidden");
};

const highScoresList = document.getElementById("highScoresList");
highScoresList.innerHTML = hightScores.map((score) => {
  return `<li class="hight-score"><span>${score.name}</span>  <span>${score.score}</span> </li>`;
});
