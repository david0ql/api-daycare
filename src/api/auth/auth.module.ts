import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import envVars from 'src/config/env';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRolesEntity } from 'src/entities/user_roles.entity';

@Module({
  providers: [JwtStrategy, AuthService],
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: envVars.JWT_SECRET,
      signOptions: { expiresIn: '365d' },
    }),
    TypeOrmModule.forFeature([UsersEntity, UserRolesEntity]),
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}