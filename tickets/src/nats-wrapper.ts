import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client? : Stan;

  get client() {
    if(!this._client) {
      throw new Error('Cannot access nats client before connecting to nats streaming server');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      })
    })
  }
}

export const natsWrapper = new NatsWrapper();