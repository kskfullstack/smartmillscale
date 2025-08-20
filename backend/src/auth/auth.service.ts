import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const userWithRoles = await this.userService.findByIdWithRoles(user.id);
    const role = userWithRoles.userRole ? {
      id: userWithRoles.userRole.role.id,
      name: userWithRoles.userRole.role.name,
      permissions: this.parsePermissions(userWithRoles.userRole.role.permissions),
    } : null;

    const payload = { 
      username: user.username, 
      sub: user.id,
      role: role,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: role,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(user: any) {
    return this.login(user);
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