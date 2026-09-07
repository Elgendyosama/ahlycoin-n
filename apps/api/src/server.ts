import * as http from 'http';
import app from './app';
import { config } from './config/env';
import { initSocketServer } from './sockets';
import { MatchSimulatorService } from './services/simulator.service';

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocketServer(server);

// Start match real-time event simulator
const simulator = new MatchSimulatorService(io);
simulator.startSimulation();

server.listen(config.port, () => {
  console.log(`🚀 Sports Social API Server listening on port ${config.port}`);
  console.log(`📡 Socket.IO server running on http://localhost:${config.port}`);
});
