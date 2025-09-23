import { Request, Response, NextFunction } from "express";
import Todo from "../../models/Todo";

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newTodo = await Todo.create({ ...req.body, user: req.body.userId });
    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
};

export const getAllTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    next(err);
  }
};

export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { todoId } = req.params;
  try {
    const foundTodo = await Todo.findById(todoId);
    if (foundTodo) {
      await foundTodo.deleteOne();
      res.status(200).json({ message: "deleted" });
    } else {
      return next({
        status: 404,
        message: "couldnt find todo",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { todoId } = req.params;
  try {
    const foundTodo = await Todo.findById(todoId);
    if (foundTodo) {
      await foundTodo.updateOne(req.body);
      res.status(200).json({ message: "updated" });
    }
  } catch (err) {
    next(err);
  }
};

export const findTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { todoId } = req.params;
  try {
    const foundTodo = await Todo.findById(todoId);
    if (foundTodo) {
      return res.status(200).json(foundTodo);
    } else {
      return next({
        status: 404,
        message: "todo not found",
      });
    }
  } catch (err) {
    next(err);
  }
};
