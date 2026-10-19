import { Injectable } from '@nestjs/common';
import { seedUsers } from './seed';
import type { User } from './types';

@Injectable()
export class UsersRepository {
  private readonly users = new Map<string, User>(seedUsers().map((u) => [u.id, u]));

  findById(id: string): User | undefined {
    return this.users.get(id);
  }
}
