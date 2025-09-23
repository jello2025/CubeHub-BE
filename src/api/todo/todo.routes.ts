import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  updateTodo,
  findTodoById,
  getAllTodos,
} from "./todo.controller";

export const todoRouter = Router();

todoRouter.post("/", createTodo);
todoRouter.delete("/:todoId", deleteTodo);
todoRouter.put("/:todoId", updateTodo);
todoRouter.get("/:todoId", findTodoById);
todoRouter.get("/", getAllTodos);
