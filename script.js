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

  // User data storage
  let userData = {};
  let currentQuestion = null;

  // Hide overlay initially
  overlay.classList.add("hidden");

  // Check if user has already submitted the form
  if (localStorage.getItem("quizSubmitted") === "true") {
    showPopup("You have already participated in this quiz. Would you like to try again?", true);
    return;
  } else {
    // Make sure form is visible; quiz & result containers hidden
    formContainer.classList.remove("hidden");
    quizContainer.classList.add("hidden");
    resultContainer.classList.add("hidden");
  }

  // Form submission
  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate form fields
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const company = document.getElementById("company").value.trim();

    if (!name || !email || !phone || !company) {
      showPopup("Please fill in all fields to continue.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopup("Please enter a valid email address.");
      return;
    }

    // Collect form data
    userData = {
      name: name,
      email: email,
      phone: phone,
      company: company,
      timestamp: new Date().toISOString(),
      result: ""
    };

    // Hide form, show quiz container and loading spinner
    formContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    loadingSpinner.classList.remove("hidden");

    // Load quiz question
    loadQuizQuestion();
  });

  // Load quiz question from JSON file with fallback questions if fetch fails
  function loadQuizQuestion() {
    setTimeout(() => {
      const fallbackQuestions = [
        {
          question: "What is the most effective way to improve productivity?",
          options: [
            "Multitasking on several projects at once",
            "Working longer hours",
            "Using the Pomodoro Technique",
            "Eliminating distractions and focusing on one task"
          ],
          correctIndex: 3
        },
        {
          question: "Which of these is considered a key principle of effective leadership?",
          options: [
            "Micromanaging team members",
            "Leading by example",
            "Avoiding difficult conversations",
            "Making all decisions independently"
          ],
          correctIndex: 1
        },
        {
          question: "What is the most important factor in building a successful business?",
          options: [
            "Having a large marketing budget",
            "Solving a real problem for customers",
            "Securing venture capital funding",
            "Having a prestigious office location"
          ],
          correctIndex: 1
        },
        {
          question: "Which time management strategy is most effective for long-term productivity?",
          options: [
            "Working on urgent tasks first",
            "Prioritizing based on importance rather than urgency",
            "Handling emails as they arrive",
            "Taking on multiple projects simultaneously"
          ],
          correctIndex: 1
        },
        {
          question: "What is the key to effective communication in a team?",
          options: [
            "Speaking more than listening",
            "Using technical jargon",
            "Active listening and clear messaging",
            "Communicating only through formal channels"
          ],
          correctIndex: 2
        }
      ];

      fetch("questions.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load questions.json");
          }
          return response.json();
        })
        .then((data) => {
          displayQuestion(data);
        })
        .catch((error) => {
          console.error("Error loading questions:", error);
          // Use fallback questions if fetch fails
          displayQuestion(fallbackQuestions);
        });
    }, 1000); // 1 second simulated delay
  }

  // Display question from data
  function displayQuestion(questions) {
    // Hide loading spinner
    loadingSpinner.classList.add("hidden");

    // Select a random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];

    // Display question text with fade-in animation
    questionText.style.opacity = "0";
    questionText.textContent = currentQuestion.question;
    setTimeout(() => {
      questionText.style.transition = "opacity 0.5s ease";
      questionText.style.opacity = "1";
    }, 100);

    // Clear previous options
    optionsContainer.innerHTML = "";

    // Add each option with staggered animation
    currentQuestion.options.forEach((option, index) => {
      const optionButton = document.createElement("button");
      optionButton.classList.add("option");
      optionButton.textContent = option;
      optionButton.dataset.index = index;
      optionButton.style.opacity = "0";
      optionButton.style.transform = "translateY(10px)";
      optionButton.addEventListener("click", function () {
        checkAnswer(Number.parseInt(this.dataset.index));
      });
      optionsContainer.appendChild(optionButton);
      setTimeout(() => {
        optionButton.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        optionButton.style.opacity = "1";
        optionButton.style.transform = "translateY(0)";
      }, 150 + index * 100);
    });
  }

  // Check user's answer and submit result
  function checkAnswer(selectedIndex) {
    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    userData.result = isCorrect ? "Correct" : "Wrong";

    // Submit data to Google Sheets and handle errors
    submitToGoogleSheets(userData)
      .then(() => {
        console.log("Data submitted successfully");
      })
      .catch((error) => {
        console.error("Error submitting data:", error);
        // Save data locally if submission fails
        saveDataLocally(userData);
      })
      .finally(() => {
        showResult(isCorrect);
      });
  }

  // Show result based on whether the answer is correct
  function showResult(isCorrect) {
    quizContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");

    if (isCorrect) {
      correctAnswer.classList.remove("hidden");
      // If there's a progress bar element, animate it
      const progressFill = document.querySelector(".progress-fill");
      if (progressFill) {
        progressFill.style.animation = "progress 3s linear forwards";
      }
      // Redirect to share page after 3 seconds
      setTimeout(() => {
        window.location.href = "share.html";
      }, 3000);
    } else {
      wrongAnswer.classList.remove("hidden");
    }

    // Mark quiz as submitted in localStorage
    localStorage.setItem("quizSubmitted", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
  }

function submitToGoogleSheets(data) {
  return new Promise((resolve, reject) => {
    // Use your correct deployed Google Apps Script URL
    const scriptURL = "https://script.google.com/macros/s/AKfycbxTK4LZi3jGqoR16A9Qv4vtCxfwYBLMd-vP2ByCpEe8j2CuvvuMM2KapucV9KffenhSQg/exec";
    
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    
    fetch(scriptURL, {
      method: "POST",
      body: formData
      // No mode specified, so it defaults to "cors"
    })
      .then(response => response.json()) // Now you'll be able to read the response
      .then(() => resolve())
      .catch(error => {
        console.error("Fetch error:", error);
        reject(error);
      });
  });
}

  // Save data locally as a fallback when submission fails
  function saveDataLocally(data) {
    try {
      const existingData = JSON.parse(localStorage.getItem("quizResponses") || "[]");
      existingData.push(data);
      localStorage.setItem("quizResponses", JSON.stringify(existingData));
      console.log("Data saved locally as fallback");
    } catch (error) {
      console.error("Error saving data locally:", error);
    }
  }

  // Popup functionality to show messages and, if needed, a retry button
  function showPopup(message, isRetry = false) {
    popupContent.textContent = message;
    if (isRetry) {
      const retryButton = document.createElement("button");
      retryButton.classList.add("btn-primary");
      retryButton.style.marginTop = "15px";
      retryButton.textContent = "Try Again";
      retryButton.addEventListener("click", () => {
        localStorage.removeItem("quizSubmitted");
        localStorage.removeItem("userData");
        overlay.classList.add("hidden");
        location.reload();
      });
      popupContent.appendChild(document.createElement("br"));
      popupContent.appendChild(document.createElement("br"));
      popupContent.appendChild(retryButton);
    }
    overlay.classList.remove("hidden");
  }

  // Close the popup when the close button is clicked
  popupClose.addEventListener("click", () => {
    overlay.classList.add("hidden");
    if (localStorage.getItem("quizSubmitted") === "true" && !popupContent.querySelector(".btn-primary")) {
      window.location.href = "discount.html";
    }
  });
});
