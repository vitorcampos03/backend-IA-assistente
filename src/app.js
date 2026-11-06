import 'dotenv/config';
import express from 'express';
import assistantRoutes from './routes/assistantRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/assistant', assistantRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Assistente Técnico no ar.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});