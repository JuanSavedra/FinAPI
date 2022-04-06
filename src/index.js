const express = require('express');
const { v4: uuidv4 } = require ("uuid") 
const app = express();
app.use(express.json()); //Permitindo JSON através do Middleware

/* Dados da conta
cpf - string
name - string
id - uuid
statement - []
*/

//Middleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find(customer => 
        customer.cpf == cpf
    );

    if (!customer) {
        return response.status(400).json({ error: "Customer not found"});
    }

    request.customer = customer;

    return next();
}

//Vendo a renda
function getBalance(statement) {
    const balance = statement.reduce((accumulator, operation) => {
        if(operation.type === "credit") {
            return accumulator + operation.amount;
        } else {
            return accumulator - operation.amount;
        }
    }, 0 /* Valor incial */);

    return balance;
}

const customers = [];

//Criando um usuário.
app.post("/account", (request, response) => {
    const { cpf, name } = request.body;
    const id = uuidv4();

    const customerAlreadyExists = customers.some((customer) => 
        customer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});

// app.use(verifyIfExistsAccountCPF); Faz com que todas as próximas rotas usem o Middleware

//Buscando dados de extrato.
app.get("/statement", verifyIfExistsAccountCPF, /* Passando Middleware como Parâmetro (Pode ser mais que um) */ 
    (request, response) => {
    const { customer } = request;
    return response.json(customer.statement);
});

//Criando uma operação de depósito.
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOperationToDeposit = {
        description,
        amount,
        createdAt: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperationToDeposit);

    return response.status(201).send();
});

//Criando uma operação de saque.
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;
    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({ error: "Insufficient funds!" })
    };

    const statementOperation = {
        amount,
        createdAt: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.listen(3333);