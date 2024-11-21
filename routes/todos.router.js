import express from "express";
import Joi from "joi";
import Todo from "../schemas/todo.schemas.js";
const router = express.Router();

const createdTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

/** 할일 등록 API */

router.post("/todos", async (req, res, next) => {
  //const { value } = req.body;
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    if (!value) {
      return res.status(400).json({
        errorMessage: "해야할 일 (value) 데이터가 존재하지 않습니다.",
      });
    }

    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    const todo = new Todo({ value, order });
    await todo.save();

    return res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
});

router.get("/todos", async (req, res, next) => {
  const todos = await Todo.find().sort("-order").exec();
  return res.status(200).json({ todos });
});

router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야할 일 입니다." });
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value !== undefined) {
    currentTodo.value = value;
  }

  // order가 없는 경우 바로 저장하고 종료
  if (!order) {
    await currentTodo.save();
    return res.status(200).json(currentTodo); // 또는 다른 적절한 응답
  }

  // order가 있을 경우 targetTodo를 찾고 업데이트
  const targetTodo = await Todo.findOne({ order }).exec();

  if (targetTodo) {
    targetTodo.order = currentTodo.order;
    await targetTodo.save();
  }

  currentTodo.order = order; // currentTodo의 order 업데이트
  await currentTodo.save(); // currentTodo 저장
  res.status(200).json(currentTodo); // 성공적으로 업데이트된 todo를 응답
});

router.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const todo = await Todo.findById(todoId).exec();

  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야할 일 정보입니다." });
  }
  await Todo.deleteOne({ _id: todoId });
  return res.status(200).json({});
});

export default router;
