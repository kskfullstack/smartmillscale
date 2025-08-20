import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Get full user data with role from database
    const user = await this.userService.findByIdWithRoles(payload.sub);
    if (!user) {
      return null;
    }

    // Transform userRole to role object for consistency
    const role = user.userRole ? {
      id: user.userRole.role.id,
      name: user.userRole.role.name,
      permissions: this.parsePermissions(user.userRole.role.permissions),
    } : null;

    const { password, ...result } = user;
    return {
      ...result,
      role: role,
    };
  }

  private parsePermissions(permissions: string | null): any[] {
    if (!permissions) {
      return [];
    }

    try {
      return JSON.parse(permissions);
    } catch (error) {
      console.error('Failed to parse role permissions:', error);
      return [];
    }
  }
}