document.addEventListener('DOMContentLoaded', () => {
  const createQuizForm = document.getElementById('create-quiz-form');
  const addQuestionButton = document.getElementById('add-question');
  const questionsContainer = document.getElementById('questions');
  const quizList = document.getElementById('quizzes');
  const quizContainer = document.getElementById('quiz-container');
  const quizTitleDisplay = document.getElementById('quiz-title-display');
  const quizQuestionsContainer = document.getElementById('quiz-questions');
  const submitQuizButton = document.getElementById('submit-quiz');
  const quizResult = document.getElementById('quiz-result');
  const scoreDisplay = document.getElementById('score');
  const backToQuizzesButton = document.getElementById('back-to-quizzes');
  const backToQuizzesResultButton = document.getElementById('back-to-quizzes-result');
  const notification = document.getElementById('notification');

  const apiUrl = 'http://localhost:3000/api/quizzes';

  addQuestionButton.addEventListener('click', () => {
    const questionTemplate = `
      <div class="question animate__animated animate__fadeIn">
        <input type="text" class="question-text" placeholder="Question" required>
        <div class="options">
          <input type="text" class="option" placeholder="Option 1" required>
          <input type="text" class="option" placeholder="Option 2" required>
          <input type="text" class="option" placeholder="Option 3" required>
          <input type="text" class="option" placeholder="Option 4" required>
        </div>
        <select class="correct-option">
          <option value="0">Option 1</option>
          <option value="1">Option 2</option>
          <option value="2">Option 3</option>
          <option value="3">Option 4</option>
        </select>
      </div>
    `;
    questionsContainer.insertAdjacentHTML('beforeend', questionTemplate);
  });

  createQuizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('quiz-title').value;
    const questions = Array.from(document.getElementsByClassName('question')).map(question => ({
      text: question.querySelector('.question-text').value,
      options: Array.from(question.getElementsByClassName('option')).map(option => option.value),
      correct: question.querySelector('.correct-option').value
    }));
    const response = await fetch(`${apiUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, questions })
    });

    if (response.ok) {
      showNotification('Quiz created successfully!', 'success');
      fetchQuizzes();
      createQuizForm.reset();
    } else {
      showNotification('Failed to create quiz.', 'error');
    }
  });

  async function fetchQuizzes() {
    const response = await fetch(`${apiUrl}/list`);
    const quizzes = await response.json();
    renderQuizList(quizzes);
  }

  function renderQuizList(quizzes) {
    quizList.innerHTML = '';
    quizzes.forEach((quiz) => {
      const quizItem = document.createElement('li');
      quizItem.textContent = quiz.title;
      quizItem.addEventListener('click', () => startQuiz(quiz._id));
      quizList.appendChild(quizItem);
    });
  }

  async function startQuiz(quizId) {
    const response = await fetch(`${apiUrl}/${quizId}`);
    const quiz = await response.json();
    quizTitleDisplay.textContent = quiz.title;
    quizQuestionsContainer.innerHTML = '';
    quiz.questions.forEach((question, qIndex) => {
      const questionContainer = document.createElement('div');
      questionContainer.classList.add('question');
      questionContainer.innerHTML = `
        <p>${question.text}</p>
        ${question.options.map((option, oIndex) => `
          <label>
            <input type="radio" name="question-${qIndex}" value="${oIndex}">
            ${option}
          </label>
        `).join('')}
      `;
      quizQuestionsContainer.appendChild(questionContainer);
    });
    quizContainer.style.display = 'block';
    submitQuizButton.style.display = 'block';
    submitQuizButton.onclick = () => submitQuiz(quiz);
  }

  function submitQuiz(quiz) {
    let score = 0;
    quiz.questions.forEach((question, qIndex) => {
      const selectedOption = document.querySelector(`input[name="question-${qIndex}"]:checked`);
      if (selectedOption && parseInt(selectedOption.value) === question.correct) {
        score++;
      }
    });
    displayResult(score, quiz.questions.length);
  }

  function displayResult(score, total) {
    scoreDisplay.textContent = `${score} / ${total}`;
    quizContainer.style.display = 'none';
    submitQuizButton.style.display = 'none';
    quizResult.style.display = 'block';
  }

  backToQuizzesButton.addEventListener('click', () => {
    quizContainer.style.display = 'none';
    quizResult.style.display = 'none';
  });

  backToQuizzesResultButton.addEventListener('click', () => {
    quizResult.style.display = 'none';
    quizContainer.style.display = 'none';
  });

  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  fetchQuizzes();
});
