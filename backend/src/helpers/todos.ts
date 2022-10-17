import {TodoItem} from "../models/TodoItem";
//import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import { TodosAccess } from "./todosAcess";
import { generateUploadUrlUtils } from "./attachmentUtils";

const uuidv4 = require('uuid/v4');
const todosAccess = new TodosAccess();

export function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId =  uuidv4();
    const s3BucketName = process.env.S3_BUCKET_NAME;
    
    return todosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
}

export function deleteTodo(todoId: string, userId: string): Promise<string> {
    return todosAccess.deleteTodo(todoId, userId);
}

export function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate> {
    return todosAccess.updateTodo(updateTodoRequest, todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return generateUploadUrlUtils(todoId);
}

export function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todosAccess.getTodosForUser(userId);
}
