const { request, response } = require('express');
const express = require('express')

const { v4: uuidv4 }  = require('uuid')

const app = express();

app.use(express.json());

const customers = [];

function accountVerify(request, response, next){
    const { cpf } = request.headers;

    const customer = customers.find((custumer) => custumer.cpf === cpf);

    if(!customer){
        return response.status(400).json({error:"Custumer not found"})
    }

    request.customer = customer;

    return next();

}

app.post("/accounts" , (request , response) => {
    const { cpf , name } = request.body;

    const customerAlreadyExists = customers.some(
        customers => customers.cpf === cpf)

        if(customerAlreadyExists){
            return response.status(400).json({error:"Customer already exists"});
        }

    customers.push({
        cpf,
        name,
        id: uuidv4(), 
        statement: []
    });

    return response.status(201).json({message:"Account created"});

});

app.get("/statement" , accountVerify , (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.post("/deposit", accountVerify, (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementeOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "Credit"
    }

    customer.statement.push(statementeOperation)

    return response.status(201).json({message: "Deposited Sucess"})
});

app.get("/statement/date" , accountVerify , (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return response.json(customer.statement);
});

app.put("/account", accountVerify, (request, response) =>{
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send(customer);
});

app.get("/account", accountVerify, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.delete("/account", accountVerify, (request, response) => {
    const { customer } = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers);
});

app.listen(3333, () =>{
    console.log("server is running in port 3333")
});