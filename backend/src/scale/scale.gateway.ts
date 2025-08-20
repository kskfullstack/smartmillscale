import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

export interface ScaleData {
  weight: number;
  unit: string;
  status: 'stable' | 'unstable' | 'overload' | 'underload';
  timestamp: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/scale',
})
export class ScaleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ScaleGateway.name);
  private connectedClients = new Set<string>();
  
  // Simulate scale data for development
  private scaleSimulation: NodeJS.Timeout;
  private currentWeight = 0;
  private isSimulating = false;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.add(client.id);
    
    // Send initial connection status
    client.emit('scale-status', {
      connected: true,
      message: 'Connected to digital scale',
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('start-weighing')
  handleStartWeighing(@ConnectedSocket() client: Socket) {
    this.logger.log(`Starting weighing session for client: ${client.id}`);
    this.startScaleSimulation();
    client.emit('weighing-started', { message: 'Weighing session started' });
  }

  @SubscribeMessage('stop-weighing')
  handleStopWeighing(@ConnectedSocket() client: Socket) {
    this.logger.log(`Stopping weighing session for client: ${client.id}`);
    this.stopScaleSimulation();
    client.emit('weighing-stopped', { message: 'Weighing session stopped' });
  }

  @SubscribeMessage('tare-scale')
  handleTareScale(@ConnectedSocket() client: Socket) {
    this.logger.log(`Tare scale for client: ${client.id}`);
    this.currentWeight = 0;
    client.emit('scale-tared', { message: 'Scale tared successfully' });
  }

  @SubscribeMessage('get-current-weight')
  handleGetCurrentWeight(@ConnectedSocket() client: Socket) {
    const scaleData: ScaleData = {
      weight: this.currentWeight,
      unit: 'kg',
      status: this.getWeightStatus(this.currentWeight),
      timestamp: new Date(),
    };
    client.emit('current-weight', scaleData);
  }

  // Simulate real digital scale behavior
  private startScaleSimulation() {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    this.scaleSimulation = setInterval(() => {
      // Simulate weight fluctuations and realistic behavior
      const variation = (Math.random() - 0.5) * 2; // ±1 kg variation
      this.currentWeight = Math.max(0, this.currentWeight + variation);
      
      // Simulate truck loading scenario
      if (Math.random() < 0.1) {
        // 10% chance of significant weight change (truck loading/unloading)
        this.currentWeight += (Math.random() - 0.3) * 1000; // ±700kg change
        this.currentWeight = Math.max(0, Math.min(this.currentWeight, 50000)); // Max 50 tons
      }

      const scaleData: ScaleData = {
        weight: Math.round(this.currentWeight * 10) / 10, // Round to 1 decimal
        unit: 'kg',
        status: this.getWeightStatus(this.currentWeight),
        timestamp: new Date(),
      };

      // Broadcast to all connected clients
      this.server.emit('scale-data', scaleData);
    }, 500); // Update every 500ms
  }

  private stopScaleSimulation() {
    if (this.scaleSimulation) {
      clearInterval(this.scaleSimulation);
      this.isSimulating = false;
    }
  }

  private getWeightStatus(weight: number): 'stable' | 'unstable' | 'overload' | 'underload' {
    if (weight > 50000) return 'overload';
    if (weight < 0) return 'underload';
    if (weight > 100 && Math.random() < 0.8) return 'stable';
    return 'unstable';
  }

  // Method to receive real scale data (for production use)
  public broadcastScaleData(scaleData: ScaleData) {
    this.server.emit('scale-data', scaleData);
  }

  // Method to simulate weight setting (for testing)
  public setWeight(weight: number) {
    this.currentWeight = weight;
    const scaleData: ScaleData = {
      weight: Math.round(weight * 10) / 10,
      unit: 'kg',
      status: this.getWeightStatus(weight),
      timestamp: new Date(),
    };
    this.server.emit('scale-data', scaleData);
  }
}