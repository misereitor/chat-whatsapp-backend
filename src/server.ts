import { server } from './app'; // Importando o servidor do app.ts

const port = 5000;

// Iniciar o servidor HTTP
server.listen(port, (): void => {
  console.log(`Server is running at http://localhost:${port}`);
});
