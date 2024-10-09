import pool from '../config/pg_db.conf';
import { Channel } from '../model/channel-model';

export async function createChannel(channel: Channel) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO channels (company_id, channel_type_id, name, connection, is_active)' +
        'VALUES' +
        '($1, $2, $3, $4, $5) RETURNING *',
      values: [
        channel.company_id,
        channel.channel_type_id,
        channel.name,
        channel.connection,
        channel.is_active
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Channel;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateChannel(channel: Channel) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE channels SET' +
        'name = $1, connection = $2, channel_type_id = $3, update_at = CURRENT_TIMESTAMP WHERE id = $5',
      values: [channel.name, channel.connection, channel.channel_type_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desactiveChannel(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE channels SET is_active = false, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function activeChannel(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE channels SET is_active = true, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteChannel(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM channels WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
