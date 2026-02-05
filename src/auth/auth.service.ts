import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshSession } from './entities/refresh-session.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(RefreshSession) private sessionsRepo: Repository<RefreshSession>,
    private jwt: JwtService,
  ) {}

  private async hashRefresh(token: string) {
    return bcrypt.hash(token, 10);
  }

  private async compareRefresh(token: string, hash: string) {
    return bcrypt.compare(token, hash);
  }

  private makeAccessToken(user: User, sessionId: string) {
    return this.jwt.sign({
      sub: user.id,
      login: user.login,
      sessionId,
    });
  }

  private makeRefreshToken() {
    return uuid() + '.' + uuid();
  }

  async signup(login: string, password: string) {
    const exists = await this.usersRepo.findOne({ where: { login } });
    if (exists) throw new BadRequestException('User already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.usersRepo.save({
      login,
      passwordHash,
    });

    return this.createSessionAndTokens(user);
  }

  async signin(login: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { login } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.createSessionAndTokens(user);
  }

  private async createSessionAndTokens(user: User) {
    const deviceId = uuid();

    const refreshToken = this.makeRefreshToken();
    const refreshHash = await this.hashRefresh(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await this.sessionsRepo.save({
      userId: user.id,
      deviceId,
      refreshTokenHash: refreshHash,
      expiresAt,
      isRevoked: false,
    });

    const accessToken = this.makeAccessToken(user, session.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const sessions = await this.sessionsRepo.find({
      where: { isRevoked: false },
    });

    const found = await this.findSessionByRefreshToken(refreshToken, sessions);
    if (!found) throw new UnauthorizedException('Invalid refresh token');

    if (found.expiresAt.getTime() < Date.now()) {
      found.isRevoked = true;
      await this.sessionsRepo.save(found);
      throw new UnauthorizedException('Refresh expired');
    }

    const user = await this.usersRepo.findOne({ where: { id: found.userId } });
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const newRefresh = this.makeRefreshToken();
    found.refreshTokenHash = await this.hashRefresh(newRefresh);
    await this.sessionsRepo.save(found);

    const access = this.makeAccessToken(user, found.id);

    return {
      access_token: access,
      refresh_token: newRefresh,
    };
  }

  private async findSessionByRefreshToken(refresh: string, sessions: RefreshSession[]) {
    for (const s of sessions) {
      const ok = await this.compareRefresh(refresh, s.refreshTokenHash);
      if (ok) return s;
    }
    return null;
  }

  async logout(refreshToken: string) {
    const sessions = await this.sessionsRepo.find({
      where: { isRevoked: false },
    });

    const found = await this.findSessionByRefreshToken(refreshToken, sessions);
    if (!found) return { ok: true };

    found.isRevoked = true;
    await this.sessionsRepo.save(found);

    return { ok: true };
  }
}
