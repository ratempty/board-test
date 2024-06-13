import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request as RequestType, Response as ResponseType } from 'express';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      const accessToken = cookies.Authorization;
      const refreshToken = cookies.refreshToken;

      const decodedAccessToken: any = jwt.decode(accessToken);
      if (decodedAccessToken && decodedAccessToken.exp * 1000 > Date.now()) {
        return accessToken;
      } else {
        const decodedRefreshToken: any = jwt.decode(refreshToken);
        if (
          decodedRefreshToken &&
          decodedRefreshToken.exp * 1000 > Date.now()
        ) {
          const newAccessToken = jwt.sign(
            { email: decodedRefreshToken.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' },
          );

          req.res.cookie('Authorization', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
          return newAccessToken;
        }
      }
    }
    return null;
  }

  async validate(payload: any) {
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('해당하는 사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}
