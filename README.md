# 💻 Sistemas para avaliações TRON

#### `API completa para um sistema de avaliações 180º`

## **Objetivo** 

O objetivo dessa **API** é proporcionar um projeto completo para ***autoavaliação e avaliação externa***. Além disso, proporciona um ***banco de dados*** configurado para armazenar funcionários, avaliações e perguntas.

## **O que o sistema entrega**

**Visão do Colaborador:**

- Interface intuitiva para realizar a avaliação 180º.

- Segurança no primeiro acesso com criação de senha personalizada.

**Visão do Gestor:**

- Dashboard centralizado para visualizar a equipe.

- Geração automática da Matriz Nine Box baseada nas avaliações.

**Automação e Comunicação:**

- Envio de e-mails de confirmação e alertas via Nodemailer.

## **Tecnologias usadas** 

- Typescript `v5.9.3`

- Cors: `v2.8.5`
    
- Express: `v5.2.1`

- Nodemon: `v3.1.11`

- TS-Node: `v10.9.2`

- SQLite3: `v5.1.7`

- Nodemailer: `v7.0.12`

- React: `v19.2`

- Vite: `V7.3.1`

- ### Para rodar completamente a API, usaremos dois terminais, respectivamente rodando o back-end e o front-end.

## **Preparando para rodar a API ([Linux]())**

- A API foi originalmente feita em [Windows](), para rodá-la no [Linux]() é preciso realizar algumas mudanças. Para funcionar perfeitamente em [Linux](), é preciso deletar a pasta node_modules tanto do backend quanto do frontend, depois disso delete também a pasta package-lock.json do backend.

- Depois disso, rode esse comando tanto na pasta backend quanto frontend:

      npm install

- A partir disso, todo o  código é funcional em Linux.

## **Iniciando o servidor**

- Como dito anteriormente, vamos usar dois terminais para esse processo. Portanto, abra dois terminais, dirija um dos terminais à pasta backend e dirija o outro para a pasta frontend. Usando esse comando vá até o backend:

      cd Back-end_REST_API_Express_e_sqlite/backend

- Para o frontend use esse comando:

      cd  Back-end_REST_API_Express_e_sqlite/frontend

- Agora, é preciso iniciar o servidor em ambos os terminais, digite o seguinte comando em AMBOS:

      npm run dev

## **Rodando o sistema**

- Agora que tudo está organizado, se dirija para http://localhost:5173 e faça login.

- Para logar como Gestor use:

      E-mail: gestor@bitforge.com

      Senha: gestor

- Para logar como Admin use:

      E-mail: admin@bitforge.com

      Senha: admin

- Para logar como usuário use:

      E-mail: funcionario@gmail.com

      Senha: funcionario

- Caso o usuário não tenha sido cadastrado, ele precisa criar uma nova senha.

## Diagrama do sistema

```mermaid
graph TD
    A[Frontend: React] -->|Requisição Login| B(Backend: Express)
    B -->|Consulta Credenciais| C[(Banco: SQLite3)]
    C -->|Retorna Usuário| B
    B -->|Gera Token/Sessão| A
    A -->|Envia Avaliação 180º| B
    B -->|Salva Respostas| C
    B -->|Envia E-mail de Confirmação| D[Nodemailer]