import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

const { SECRET: secret = 'secret' } = process.env;

@Module({
  imports: [
    forwardRef(() => LoginModule),
    forwardRef(() => RegisterModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: 3600 * 24 * 30 },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
