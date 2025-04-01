document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const formContainer = document.getElementById("form-container");
  const quizContainer = document.getElementById("quiz-container");
  const resultContainer = document.getElementById("result-container");
  const leadForm = document.getElementById("lead-form");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const correctAnswer = document.getElementById("correct-answer");
  const wrongAnswer = document.getElementById("wrong-answer");
  const overlay = document.getElementById("overlay");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");
  const popupClose = document.getElementById("popup-close");
  const loadingSpinner = document.getElementById("loading");

  let userData = {};
  let currentQuestion = null;

  overlay.classList.add("hidden");

  if (localStorage.getItem("quizSubmitted") === "true") {
    showPopup("You have already participated in this quiz. Would you like to try again?", true);
    return;
  } else {
    formContainer.classList.remove("hidden");
    quizContainer.classList.add("hidden");
    resultContainer.classList.add("hidden");
  }

  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const company = document.getElementById("company").value.trim();

    if (!name || !email || !phone || !company) {
      showPopup("Please fill in all fields to continue.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopup("Please enter a valid email address.");
      return;
    }

    userData = { name, email, phone, company, timestamp: new Date().toISOString(), result: "" };

    formContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    loadingSpinner.classList.remove("hidden");

    loadQuizQuestion();
  });

  function loadQuizQuestion() {
    setTimeout(() => {
      fetch("questions.json")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to load questions.json");
          return response.json();
        })
        .then(displayQuestion)
        .catch(() => displayQuestion(getFallbackQuestions()));
    }, 1000);
  }

  function getFallbackQuestions() {
    return [
      { question: "What is the most effective way to improve productivity?", options: ["Multitasking", "Longer hours", "Pomodoro Technique", "Focusing on one task"], correctIndex: 3 },
      { question: "Which is a key principle of leadership?", options: ["Micromanaging", "Leading by example", "Avoiding difficult talks", "Making decisions alone"], correctIndex: 1 },
    ];
  }

  function displayQuestion(questions) {
    loadingSpinner.classList.add("hidden");
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = "";

    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.classList.add("option");
      button.textContent = option;
      button.dataset.index = index;
      button.addEventListener("click", () => checkAnswer(index));
      optionsContainer.appendChild(button);
    });
  }

  function checkAnswer(selectedIndex) {
    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    userData.result = isCorrect ? "Correct" : "Wrong";

    submitToGoogleSheets(userData).finally(() => showResult(isCorrect));
  }

  function showResult(isCorrect) {
    quizContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    isCorrect ? correctAnswer.classList.remove("hidden") : wrongAnswer.classList.remove("hidden");
    localStorage.setItem("quizSubmitted", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
  }

  function submitToGoogleSheets(data) {
    return fetch("https://script.google.com/macros/s/AKfycbw32U-lFN_bL4Xnfiec91Cel0dXVXwVYa2OyVqPuHNPyhKYOH3ckWcINf5BOpf6785agQ/exec", {
      method: "POST",
      body: new URLSearchParams(data),
      mode: "no-cors"
    }).catch(() => saveDataLocally(data));
  }

  function saveDataLocally(data) {
    const existingData = JSON.parse(localStorage.getItem("quizResponses") || "[]");
    existingData.push(data);
    localStorage.setItem("quizResponses", JSON.stringify(existingData));
  }

  function showPopup(message, isRetry = false) {
    popupContent.textContent = message;
    if (isRetry) {
      const retryButton = document.createElement("button");
      retryButton.classList.add("btn-primary");
      retryButton.textContent = "Try Again";
      retryButton.addEventListener("click", () => {
        localStorage.clear();
        location.reload();
      });
      popupContent.appendChild(document.createElement("br"));
      popupContent.appendChild(retryButton);
    }
    overlay.classList.remove("hidden");
  }

  popupClose.addEventListener("click", () => overlay.classList.add("hidden"));
});
