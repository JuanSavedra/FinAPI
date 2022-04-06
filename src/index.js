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

const customers = [];

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


app.get("/statement", verifyIfExistsAccountCPF, /* Passando Middleware como Parâmetro (Pode ser mais que um) */ 
    (request, response) => {
    const { customer } = request;
    return response.json(customer.statement);
});

app.listen(3333);