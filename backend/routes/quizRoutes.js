const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');

router.post('/create', async (req, res) => {
  const { title, questions } = req.body;
  const quiz = new Quiz({ title, questions });
  await quiz.save();
  res.status(201).send(quiz);
});

router.get('/list', async (req, res) => {
  const quizzes = await Quiz.find();
  res.status(200).send(quizzes);
});

router.get('/:id', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  res.status(200).send(quiz);
});

module.exports = router;
