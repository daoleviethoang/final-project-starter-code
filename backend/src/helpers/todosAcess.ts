import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info("Getting all todo")
        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        logger.info(result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info("Creating new todo");

        const params = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        logger.info(result);
        const attributes = result.Attributes;

        return attributes as TodoItem;
    }

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        logger.info("Updating todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        logger.info(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async deleteTodo(todoId: string, userId: string): Promise<string> {
        logger.info("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        logger.info(result);

        return todoId as string;
    }
}
