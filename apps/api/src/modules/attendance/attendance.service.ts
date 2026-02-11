import crypto from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';

type Attendance = {
  id: string;
  guildId: string;
  game: string;
  title: string;
  startsAt: string;
  status: string;
  createdAt: string;
};

type AttendanceCheckIn = {
  id: string;
  attendanceId: string;
  memberId: string;
  status: string;
  note?: string;
  checkedInAt: string;
};

@Injectable()
export class AttendanceService {
  private attendances: Attendance[] = [];
  private checkIns: AttendanceCheckIn[] = [];

  findAll() {
    return this.attendances.map((item) => ({
      ...item,
      checkInCount: this.checkIns.filter((checkIn) => checkIn.attendanceId === item.id).length,
    }));
  }

  findOne(id: string) {
    const found = this.attendances.find((item) => item.id === id);
    if (!found) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }

    return {
      ...found,
      checkIns: this.checkIns.filter((checkIn) => checkIn.attendanceId === id),
    };
  }

  create(body: Partial<Attendance>) {
    const row: Attendance = {
      id: crypto.randomUUID(),
      guildId: body.guildId ?? '',
      game: body.game ?? 'default',
      title: body.title ?? 'Untitled attendance',
      startsAt: body.startsAt ?? new Date().toISOString(),
      status: body.status ?? 'open',
      createdAt: new Date().toISOString(),
    };

    this.attendances.push(row);
    return row;
  }

  update(id: string, body: Partial<Attendance>) {
    const index = this.attendances.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }

    this.attendances[index] = { ...this.attendances[index], ...body, id };
    return this.attendances[index];
  }

  remove(id: string) {
    this.attendances = this.attendances.filter((item) => item.id !== id);
    this.checkIns = this.checkIns.filter((item) => item.attendanceId !== id);
    return { deleted: true };
  }

  listCheckIns(attendanceId: string) {
    this.ensureAttendanceExists(attendanceId);
    return this.checkIns.filter((item) => item.attendanceId === attendanceId);
  }

  recordCheckIn(attendanceId: string, body: Partial<AttendanceCheckIn>) {
    this.ensureAttendanceExists(attendanceId);

    const existingIndex = this.checkIns.findIndex(
      (item) => item.attendanceId === attendanceId && item.memberId === body.memberId,
    );

    if (existingIndex >= 0) {
      this.checkIns[existingIndex] = {
        ...this.checkIns[existingIndex],
        status: body.status ?? this.checkIns[existingIndex].status,
        note: body.note ?? this.checkIns[existingIndex].note,
        checkedInAt: new Date().toISOString(),
      };

      return this.checkIns[existingIndex];
    }

    const row: AttendanceCheckIn = {
      id: crypto.randomUUID(),
      attendanceId,
      memberId: body.memberId ?? '',
      status: body.status ?? 'checked_in',
      note: body.note,
      checkedInAt: new Date().toISOString(),
    };

    this.checkIns.push(row);
    return row;
  }

  private ensureAttendanceExists(attendanceId: string) {
    const found = this.attendances.some((item) => item.id === attendanceId);
    if (!found) {
      throw new NotFoundException(`Attendance ${attendanceId} not found`);
    }
  }
}
