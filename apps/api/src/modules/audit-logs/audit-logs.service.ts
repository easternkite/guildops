import crypto from "node:crypto";
import { Injectable } from '@nestjs/common';
@Injectable()
export class UauditUlogsService {
  private data: any[] = [];
  findAll() { return this.data; }
  findOne(id: string) { return this.data.find((v) => v.id === id); }
  create(body: any) { const row = { id: crypto.randomUUID(), ...body }; this.data.push(row); return row; }
  update(id: string, body: any) { const i = this.data.findIndex((v) => v.id === id); if (i < 0) return null; this.data[i] = { ...this.data[i], ...body }; return this.data[i]; }
  remove(id: string) { this.data = this.data.filter((v) => v.id !== id); return { deleted: true }; }
}
